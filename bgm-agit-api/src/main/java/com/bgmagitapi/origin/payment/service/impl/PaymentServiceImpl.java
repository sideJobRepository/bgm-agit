package com.bgmagitapi.origin.payment.service.impl;

import com.bgmagitapi.origin.advice.exception.PaymentException;
import com.bgmagitapi.origin.advice.exception.ReservationConflictException;
import com.bgmagitapi.origin.advice.exception.TossPaymentApiException;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.event.dto.ReservationTalkEvent;
import com.bgmagitapi.origin.event.dto.TalkAction;
import com.bgmagitapi.origin.payment.controller.response.PaymentConfirmResponse;
import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import com.bgmagitapi.origin.payment.entity.BgmAgitPayment;
import com.bgmagitapi.origin.payment.entity.BgmAgitPaymentCancel;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentStatus;
import com.bgmagitapi.origin.payment.repository.BgmAgitPaymentRepository;
import com.bgmagitapi.origin.payment.service.PaymentCancelRecorder;
import com.bgmagitapi.origin.payment.service.PaymentFailureRecorder;
import com.bgmagitapi.origin.payment.service.PaymentService;
import com.bgmagitapi.origin.payment.service.TossPaymentsClient;
import com.bgmagitapi.origin.payment.service.response.PaymentRefundResult;
import com.bgmagitapi.origin.payment.service.response.TossPaymentResponse;
import com.bgmagitapi.origin.payment.util.TossErrorMessages;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import com.bgmagitapi.origin.repository.BgmAgitReservationRepository;
import com.bgmagitapi.origin.service.response.BizTalkCancel;
import com.bgmagitapi.origin.service.response.ReservationTalkContext;
import com.bgmagitapi.origin.util.ReservationRefundPolicy;
import com.bgmagitapi.origin.util.SlotSchedule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    // 토스가 "실제 결제 완료"로 보는 상태. 가상계좌는 WAITING_FOR_DEPOSIT 로 온다.
    private static final String TOSS_STATUS_DONE = "DONE";

    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    private final BgmAgitPaymentRepository bgmAgitPaymentRepository;
    private final BgmAgitReservationRepository bgmAgitReservationRepository;
    private final TossPaymentsClient tossPaymentsClient;
    // 실패 기록은 별도 트랜잭션(REQUIRES_NEW)이어야 롤백에 쓸려가지 않는다
    private final PaymentFailureRecorder paymentFailureRecorder;
    // 환불 시도 이력도 같은 이유로 별도 트랜잭션. 토스 호출 전에 선커밋해 멱등키를 확보한다
    private final PaymentCancelRecorder paymentCancelRecorder;
    private final ApplicationEventPublisher eventPublisher;

    // 토스 clientKey는 공개키(프론트 전달용). secretKey는 STEP 2 승인부터 사용
    @Value("${toss.client-key}")
    private String tossClientKey;

    // 결제 라이브 여부. false(심사 기간)면 결제 성공해도 예약 자동확정을 하지 않는다(공짜 예약 방지).
    @Value("${payment.live:false}")
    private boolean paymentLive;

    @Override
    public PaymentOrderResponse createOrder(Long memberId, Long reservationNo, int amount, String orderName,
                                            Integer people, Integer unitPrice) {
        BgmAgitMember member = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new PaymentException("존재 하지 않은 회원입니다."));

        // 이미 결제된 예약에 주문을 또 만들지 않는다. 결제창을 두 개 띄우면 둘 다 승인되어 이중 과금이 됐다
        if (bgmAgitPaymentRepository.existsSettledPaymentByReservationNo(reservationNo)) {
            throw new PaymentException("이미 결제가 완료된 예약입니다.");
        }

        String orderNo = "bgmagit_" + reservationNo + "_" + System.currentTimeMillis();

        BgmAgitPayment payment = new BgmAgitPayment(member, reservationNo, orderNo, amount, people, unitPrice);
        bgmAgitPaymentRepository.save(payment);

        return new PaymentOrderResponse(orderNo, amount, orderName, tossClientKey);
    }

    @Override
    public PaymentConfirmResponse confirmPayment(String paymentKey, String orderId, Integer amount, Long memberId) {
        BgmAgitPayment payment = bgmAgitPaymentRepository.findByBgmAgitOrderNo(orderId)
                .orElseThrow(() -> new PaymentException("존재하지 않는 주문입니다."));

        validatePaymentOwner(payment, memberId);
        validateAmount(payment, amount);

        if (payment.isDone()) {
            return toConfirmResponse(payment);
        }

        // 같은 예약에 이미 정산된 결제가 있으면 여기서 끊는다. 멱등성이 orderNo 단위라
        // 결제창을 두 개 띄워 각각 승인하면 예약 하나에 두 번 과금됐다(환불은 최신 1건만 돌았다).
        if (bgmAgitPaymentRepository.existsSettledPaymentByReservationNo(payment.getBgmAgitReservationNo())) {
            paymentFailureRecorder.recordAborted(orderId, null, "이미 결제가 완료된 예약");
            throw new ReservationConflictException("이미 결제가 완료된 예약입니다. 예약내역에서 확인해 주세요.");
        }

        // 주문을 만든 뒤 인원이 바뀌었으면 저장 금액이 옛 금액이다. READY 주문은 3일간 살아 있어서
        // 며칠 전 열어둔 결제창이 그대로 승인될 수 있다. 승인 전에 서버 재계산값과 다시 맞춰본다.
        validateAmountAgainstReservation(payment);

        // 승인(=과금) 전에 슬롯을 다시 본다. 대기 예약은 서로의 자리를 막지 않기 때문에
        // 여기까지 오는 사이에 같은 시간대가 다른 사람 결제로 확정됐을 수 있다.
        // 돈이 빠져나간 뒤에 알면 환불로 풀어야 하므로 반드시 confirm 앞에서 걸러낸다.
        validateReservationSlotAvailable(payment.getBgmAgitReservationNo());

        TossPaymentResponse result;
        try {
            // 토스에 넘기는 금액은 클라이언트가 보낸 값이 아니라 저장된 주문 금액이다(위에서 대조를 마쳤다)
            result = tossPaymentsClient.confirm(paymentKey, orderId, payment.getBgmAgitPaymentAmount());
        } catch (TossPaymentApiException e) {
            // 토스가 준 원문(코드+사유)을 남기고, 손님에겐 코드별 한국어 안내로 바꿔 던진다
            paymentFailureRecorder.recordAborted(orderId, e.getCode(), e.getMessage());
            throw new TossPaymentApiException(e.getCode(), TossErrorMessages.toUserMessage(e.getCode(), e.getMessage()));
        } catch (RuntimeException e) {
            // 타임아웃·네트워크 오류 등. 사유는 남기되 예외는 그대로 올린다
            paymentFailureRecorder.recordAborted(orderId, null, e.getMessage());
            throw e;
        }

        // 입금 대기(가상계좌) 건은 돈이 아직 안 들어온 상태다. 입금 웹훅이 없어 나중에 확정을
        // 걸어줄 수단이 없으므로, 발급된 결제를 즉시 취소하고 실패로 되돌린다.
        // 근본 차단은 토스 상점관리자에서 가상계좌 수단을 끄는 것.
        if (!TOSS_STATUS_DONE.equals(result.getStatus())) {
            log.warn("[payment] 지원하지 않는 결제상태로 승인됨. orderId={}, status={}", orderId, result.getStatus());
            cancelQuietly(result.getPaymentKey(), "지원하지 않는 결제수단");
            paymentFailureRecorder.recordAborted(orderId, result.getStatus(), "지원하지 않는 결제수단(입금 대기)으로 승인되어 취소함");
            throw new ReservationConflictException(
                    "입금 확인이 필요한 결제수단(가상계좌 등)은 예약금 결제에 사용할 수 없습니다. 카드 또는 간편결제로 다시 시도해 주세요.");
        }

        payment.markDone(
                result.getPaymentKey(),
                result.getMethod(),
                parseDateTime(result.getApprovedAt()),
                result.getReceiptUrl()
        );

        // 심사 기간(payment.live=false)엔 결제행만 DONE 처리하고 예약 자동확정은 하지 않는다.
        // (테스트키라 실입금이 없는데 자동확정되면 공짜 예약이 되므로. 카드사 심사는 결제창 작동만 확인)
        if (paymentLive) {
            approveReservation(payment.getBgmAgitReservationNo());
        }
        return toConfirmResponse(payment);
    }

    @Override
    public PaymentRefundResult refundReservation(Long reservationNo, int refundRate, String cancelReason) {
        return doRefund(reservationNo, bgmAgitPaymentRepository.findRefundablePaymentsForUpdate(reservationNo),
                null, refundRate, cancelReason);
    }

    @Override
    public PaymentRefundResult refundPeopleReduction(Long reservationNo, int reducedPeople, int refundRate, String cancelReason) {
        List<BgmAgitPayment> payments = bgmAgitPaymentRepository.findRefundablePaymentsForUpdate(reservationNo);
        if (reducedPeople <= 0 || payments.isEmpty()) {
            return PaymentRefundResult.nothingToRefund(refundRate);
        }

        // 단가는 결제 시점 스냅샷을 쓴다. 지금 시세로 계산하면 옛 요금제 결제건에서 결제액을 넘는다.
        // 스냅샷이 없는 결제(마작 정액, 개편 전 예약금 1만원)는 인원 차액이라는 개념이 없어 환불하지 않는다.
        Integer unitPrice = payments.stream()
                .map(BgmAgitPayment::getBgmAgitPaymentUnitPrice)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
        if (unitPrice == null) {
            log.info("[payment] 인원 축소 환불 스킵. 단가 스냅샷 없음 reservationNo={}", reservationNo);
            return PaymentRefundResult.nothingToRefund(refundRate);
        }

        return doRefund(reservationNo, payments, reducedPeople * unitPrice, refundRate, cancelReason);
    }

    @Override
    public long abortReadyOrders(Long reservationNo, String reason) {
        return bgmAgitPaymentRepository.abortReadyOrders(reservationNo, reason);
    }

    /**
     * 환불 실행.
     *
     * baseAmount 가 null 이면 남은 결제 잔액 전체가 기준이고(예약 취소), 값이 있으면 그 금액이 기준이다(인원 축소 차액).
     * 실제 환불액은 언제나 잔액으로 클램프한다 — 정책 계산만 믿으면 결제액을 넘는 취소 요청이 나간다.
     *
     * 재결제로 정산 결제가 여러 건일 수 있어 오래된 순으로 훑으며 목표액을 채운다.
     * 예전에는 최신 1건만 취소해서 나머지가 영영 환불되지 않았다.
     */
    private PaymentRefundResult doRefund(Long reservationNo, List<BgmAgitPayment> payments,
                                         Integer baseAmount, int refundRate, String cancelReason) {
        if (payments.isEmpty()) {
            return PaymentRefundResult.nothingToRefund(refundRate);
        }

        int totalRemaining = payments.stream().mapToInt(BgmAgitPayment::remainingAmount).sum();
        int base = baseAmount == null ? totalRemaining : Math.min(baseAmount, totalRemaining);
        int target = ReservationRefundPolicy.refundAmount(base, refundRate);
        if (target <= 0) {
            // 24시간 이내 취소는 환불이 0원이다. 토스에 0원을 보내면 400 이라 아예 부르지 않는다
            log.info("[payment] 환불 대상 금액 없음. reservationNo={}, rate={}", reservationNo, refundRate);
            return PaymentRefundResult.nothingToRefund(refundRate);
        }

        int refunded = 0;
        for (BgmAgitPayment payment : payments) {
            int left = target - refunded;
            if (left <= 0) {
                break;
            }
            int portion = Math.min(payment.remainingAmount(), left);
            if (portion <= 0) {
                continue;
            }

            // 토스 호출 전에 시도 행을 커밋해 멱등키를 확보한다(별도 트랜잭션)
            BgmAgitPaymentCancel attempt = paymentCancelRecorder.begin(
                    payment.getBgmAgitPaymentId(), reservationNo, portion, refundRate, cancelReason);

            // 손대지 않은 결제를 통째로 돌려주는 경우는 전액취소(cancelAmount 생략)로 보낸다.
            // 가장 잘 지원되는 경로이고 기존 동작과도 같다.
            boolean fullCancel = payment.getBgmAgitCancelAmount() == null
                    && portion == payment.remainingAmount();

            try {
                TossPaymentResponse result = tossPaymentsClient.cancel(
                        payment.getBgmAgitPaymentKey(),
                        cancelReason,
                        fullCancel ? null : portion,
                        attempt.idempotencyKey());

                applyCancelResult(payment, result, portion, cancelReason);
                TossPaymentResponse.Cancel lastCancel = result == null ? null : result.getLatestCancel();
                paymentCancelRecorder.succeed(
                        attempt.getBgmAgitPaymentCancelId(),
                        lastCancel == null ? null : lastCancel.getTransactionKey());
                refunded += portion;
            } catch (TossPaymentApiException e) {
                String message = TossErrorMessages.toUserMessage(e.getCode(), e.getMessage());
                paymentCancelRecorder.fail(attempt.getBgmAgitPaymentCancelId(),
                        "[" + e.getCode() + "] " + e.getMessage());
                // 예약 취소는 계속 진행한다(자리를 비우는 쪽이 먼저다). 관리자가 실패 행을 보고 수동 환불한다
                log.error("[payment][환불실패] 관리자 확인 필요. reservationNo={}, paymentId={}, amount={}, code={}",
                        reservationNo, payment.getBgmAgitPaymentId(), portion, e.getCode(), e);
                return PaymentRefundResult.failed(refundRate, target, refunded, message);
            } catch (RuntimeException e) {
                paymentCancelRecorder.fail(attempt.getBgmAgitPaymentCancelId(), e.getMessage());
                log.error("[payment][환불실패] 관리자 확인 필요(통신 오류). reservationNo={}, paymentId={}, amount={}",
                        reservationNo, payment.getBgmAgitPaymentId(), portion, e);
                return PaymentRefundResult.failed(refundRate, target, refunded,
                        "환불 요청 중 오류가 발생했습니다. 확인 후 안내드리겠습니다.");
            }
        }

        return PaymentRefundResult.succeeded(refundRate, target, refunded);
    }

    /**
     * 취소 결과를 결제행에 반영.
     * 누적 취소액은 토스 원장(totalAmount - balanceAmount)을 그대로 쓴다. 응답에 그 값이 없을 때만
     * 로컬 누적으로 폴백한다 — cancels 배열을 더하거나 최근 1건을 보면 재시도·부분취소에서 틀어진다.
     */
    private void applyCancelResult(BgmAgitPayment payment, TossPaymentResponse result, int portion, String cancelReason) {
        TossPaymentResponse.Cancel lastCancel = result == null ? null : result.getLatestCancel();
        Integer accumulated = result == null ? null : result.getCanceledAmount();
        if (accumulated == null) {
            int before = payment.getBgmAgitCancelAmount() == null ? 0 : payment.getBgmAgitCancelAmount();
            accumulated = before + portion;
        }
        payment.markCanceled(
                accumulated,
                lastCancel == null || lastCancel.getCancelReason() == null
                        ? cancelReason
                        : lastCancel.getCancelReason(),
                parseDateTime(lastCancel == null ? null : lastCancel.getCanceledAt())
        );
    }

    @Override
    public void recordClientFailure(String orderId, String code, String message, Long memberId) {
        // 프론트 결제 실패 페이지가 알려주는 사유. 기록이 목적이라 어떤 경우에도 예외를 던지지 않는다
        try {
            BgmAgitPayment payment = bgmAgitPaymentRepository.findByBgmAgitOrderNo(orderId).orElse(null);
            if (payment == null) {
                log.warn("[payment] 실패 리포트 무시. 주문 없음 orderId={}", orderId);
                return;
            }
            Long paymentMemberId = payment.getBgmAgitMember().getBgmAgitMemberId();
            if (!Objects.equals(paymentMemberId, memberId)) {
                log.warn("[payment] 실패 리포트 무시. 소유자 불일치 orderId={}, memberId={}", orderId, memberId);
                return;
            }
            paymentFailureRecorder.recordAborted(orderId, code, message);
        } catch (RuntimeException e) {
            log.warn("[payment] 실패 리포트 처리 중 오류. orderId={}, code={}", orderId, code, e);
        }
    }

    @Override
    public long removeOldAbortedOrders(int retentionDays) {
        // ABORTED 는 "왜 결제가 안 됐나"를 되짚는 진단용 이력이라 READY 보다 오래 남긴다.
        // DONE/CANCELED 는 결제 이력이라 여전히 건드리지 않는다.
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
        long removed = bgmAgitPaymentRepository.deleteOldAbortedOrders(cutoff);
        if (removed > 0) {
            log.info("[payment] 결제 실패 이력 정리 completed. count={}, cutoff={}", removed, cutoff);
        }
        return removed;
    }

    @Override
    public long removeAbandonedOrders(int retentionDays) {
        // 결제창을 띄울 때마다 READY 주문행이 생기고, 실제 승인까지 가는 건 그중 일부다.
        // 승인 흐름이 살아있는 주문을 지우면 confirm 이 "존재하지 않는 주문"으로 실패하므로
        // 하루 이상 묵은 것만 정리한다. DONE/CANCELED 는 결제 이력이라 건드리지 않는다.
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
        long removed = bgmAgitPaymentRepository.deleteAbandonedOrders(cutoff);
        if (removed > 0) {
            log.info("[payment] 미결제 주문 정리 completed. count={}, cutoff={}", removed, cutoff);
        }
        return removed;
    }

    /**
     * 결제 승인 직전 슬롯 재검증.
     * 대기(approval='N') 예약은 서로의 자리를 막지 않으므로, 같은 시간대를 여러 명이 대기로 들고 있다가
     * 각자 결제해 전부 확정되는 이중 예약이 가능하다. 승인 직전에 확정건과 겹치는지 다시 확인한다.
     */
    private void validateReservationSlotAvailable(Long reservationNo) {
        List<BgmAgitReservation> group = bgmAgitReservationRepository.findReservationList(reservationNo);
        if (group.isEmpty()) {
            throw new ReservationConflictException("존재하지 않는 예약입니다.");
        }
        if (group.stream().anyMatch(r -> "Y".equals(r.getBgmAgitReservationCancelStatus()))) {
            throw new ReservationConflictException("취소된 예약입니다.");
        }

        LocalDate date = group.get(0).getBgmAgitReservationStartDate();
        List<Long> imageIds = group.stream()
                .map(r -> r.getBgmAgitImage().getBgmAgitImageId())
                .distinct()
                .toList();

        Set<String> takenSlots = new HashSet<>();
        for (BgmAgitReservation confirmed : bgmAgitReservationRepository
                .findConfirmedReservations(imageIds, date, reservationNo)) {
            takenSlots.add(slotKey(confirmed));
        }

        for (BgmAgitReservation mine : group) {
            if (takenSlots.contains(slotKey(mine))) {
                throw new ReservationConflictException(
                        "이미 다른 예약이 확정된 시간대입니다. 결제는 진행되지 않았으니 다른 시간대로 예약해 주세요.");
            }
        }
    }

    /** 항목 + 시간대 단위 슬롯 식별자 */
    private String slotKey(BgmAgitReservation reservation) {
        return reservation.getBgmAgitImage().getBgmAgitImageId()
                + "|" + reservation.getBgmAgitReservationStartTime()
                + "-" + reservation.getBgmAgitReservationEndTime();
    }

    /** 실패해도 원래 예외/흐름을 덮지 않도록 삼키는 전액 취소 */
    private void cancelQuietly(String paymentKey, String cancelReason) {
        if (paymentKey == null) {
            return;
        }
        try {
            // 가상계좌 즉시 취소 경로. 결제행이 아직 DONE 이 아니라 시도 이력을 만들지 않고
            // paymentKey 자체를 멱등키로 쓴다(같은 결제를 두 번 취소해도 토스가 같은 요청으로 본다)
            tossPaymentsClient.cancel(paymentKey, cancelReason, null, "bgmagit_abort_" + paymentKey);
        } catch (RuntimeException e) {
            log.warn("[payment] 결제 취소 실패. paymentKey={}, reason={}", paymentKey, cancelReason, e);
        }
    }

    private void validatePaymentOwner(BgmAgitPayment payment, Long memberId) {
        Long paymentMemberId = payment.getBgmAgitMember().getBgmAgitMemberId();
        if (!Objects.equals(paymentMemberId, memberId)) {
            throw new PaymentException("본인의 결제 주문이 아닙니다.");
        }
    }

    private void validateAmount(BgmAgitPayment payment, Integer amount) {
        if (!Objects.equals(payment.getBgmAgitPaymentAmount(), amount)) {
            // 여기서 markAborted 를 직접 부르면 바로 뒤 예외로 롤백돼 사유가 안 남는다 → 별도 트랜잭션 경유
            paymentFailureRecorder.recordAborted(payment.getBgmAgitOrderNo(), null, "결제 금액이 일치하지 않습니다.");
            throw new PaymentException("결제 금액이 일치하지 않습니다.");
        }
    }

    /**
     * 저장된 주문 금액이 지금의 예약 내용으로 다시 계산해도 같은지.
     *
     * 클라이언트 금액과 저장 금액만 맞춰보던 예전 검증은 "둘 다 옛 금액"인 경우를 통과시켰다.
     * 인원이 바뀌면 금액이 바뀌므로 반드시 서버 재계산값과도 대조한다.
     */
    private void validateAmountAgainstReservation(BgmAgitPayment payment) {
        List<BgmAgitReservation> group =
                bgmAgitReservationRepository.findReservationList(payment.getBgmAgitReservationNo());
        if (group.isEmpty()) {
            return;
        }
        BgmAgitReservation first = group.get(0);
        Integer people = first.getBgmAgitReservationPeople();
        int expected = SlotSchedule.totalPaymentAmount(
                group.stream().map(BgmAgitReservation::getBgmAgitImage).toList(),
                people == null ? 0 : people,
                first.getBgmAgitReservationStartDate());

        if (!Objects.equals(payment.getBgmAgitPaymentAmount(), expected)) {
            paymentFailureRecorder.recordAborted(payment.getBgmAgitOrderNo(), null,
                    "예약 내용 변경으로 주문 금액 불일치(주문 " + payment.getBgmAgitPaymentAmount() + " / 현재 " + expected + ")");
            throw new PaymentException("예약 인원이 변경되어 결제 금액이 달라졌습니다. 예약내역에서 다시 결제해 주세요.");
        }
    }

    private void approveReservation(Long reservationNo) {
        List<BgmAgitReservation> reservations = bgmAgitReservationRepository.findReservationList(reservationNo);
        if (reservations.isEmpty()) {
            throw new PaymentException("존재하지 않는 예약입니다.");
        }

        List<Long> idList = reservations.stream()
                .map(BgmAgitReservation::getBgmAgitReservationId)
                .toList();
        bgmAgitReservationRepository.updateCancelAndApprovalStatus("N", "Y", idList);

        BizTalkCancel bizTalkCancel = bgmAgitReservationRepository.findBizTalkCancel(reservationNo);
        if (bizTalkCancel != null) {
            ReservationTalkContext ctx = ReservationTalkContext.of("ROLE_ADMIN", reservations, bizTalkCancel);
            eventPublisher.publishEvent(new ReservationTalkEvent(TalkAction.COMPLETE, ctx));
        }
    }

    private PaymentConfirmResponse toConfirmResponse(BgmAgitPayment payment) {
        return new PaymentConfirmResponse(
                payment.getBgmAgitOrderNo(),
                payment.getBgmAgitReservationNo(),
                payment.getBgmAgitPaymentAmount(),
                payment.getBgmAgitPaymentStatus().name(),
                payment.getBgmAgitPaymentType(),
                payment.getBgmAgitPaymentReceiptUrl()
        );
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return LocalDateTime.now();
        }
        return OffsetDateTime.parse(value).toLocalDateTime();
    }
}
