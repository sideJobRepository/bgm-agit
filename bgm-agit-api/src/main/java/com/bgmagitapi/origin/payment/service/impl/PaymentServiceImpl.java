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
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentStatus;
import com.bgmagitapi.origin.payment.repository.BgmAgitPaymentRepository;
import com.bgmagitapi.origin.payment.service.PaymentFailureRecorder;
import com.bgmagitapi.origin.payment.service.PaymentService;
import com.bgmagitapi.origin.payment.service.TossPaymentsClient;
import com.bgmagitapi.origin.payment.service.response.TossPaymentResponse;
import com.bgmagitapi.origin.payment.util.TossErrorMessages;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import com.bgmagitapi.origin.repository.BgmAgitReservationRepository;
import com.bgmagitapi.origin.service.response.BizTalkCancel;
import com.bgmagitapi.origin.service.response.ReservationTalkContext;
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
    private final ApplicationEventPublisher eventPublisher;

    // 토스 clientKey는 공개키(프론트 전달용). secretKey는 STEP 2 승인부터 사용
    @Value("${toss.client-key}")
    private String tossClientKey;

    // 결제 라이브 여부. false(심사 기간)면 결제 성공해도 예약 자동확정을 하지 않는다(공짜 예약 방지).
    @Value("${payment.live:false}")
    private boolean paymentLive;

    @Override
    public PaymentOrderResponse createOrder(Long memberId, Long reservationNo, int amount, String orderName) {
        BgmAgitMember member = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new PaymentException("존재 하지 않은 회원입니다."));
        
        String orderNo = "bgmagit_" + reservationNo + "_" + System.currentTimeMillis();

        BgmAgitPayment payment = new BgmAgitPayment(member, reservationNo, orderNo, amount);
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

        // 승인(=과금) 전에 슬롯을 다시 본다. 대기 예약은 서로의 자리를 막지 않기 때문에
        // 여기까지 오는 사이에 같은 시간대가 다른 사람 결제로 확정됐을 수 있다.
        // 돈이 빠져나간 뒤에 알면 환불로 풀어야 하므로 반드시 confirm 앞에서 걸러낸다.
        validateReservationSlotAvailable(payment.getBgmAgitReservationNo());

        TossPaymentResponse result;
        try {
            result = tossPaymentsClient.confirm(paymentKey, orderId, amount);
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
    public void cancelDonePaymentByReservationNo(Long reservationNo, String cancelReason) {
        BgmAgitPayment payment = bgmAgitPaymentRepository
                .findLatestPaymentByReservationNoAndStatus(reservationNo, PaymentStatus.DONE)
                .orElse(null);
        if (payment == null) {
            return;
        }

        TossPaymentResponse result = tossPaymentsClient.cancel(payment.getBgmAgitPaymentKey(), cancelReason);
        TossPaymentResponse.Cancel lastCancel = result == null ? null : result.getLatestCancel();
        payment.markCanceled(
                lastCancel == null || lastCancel.getCancelAmount() == null
                        ? payment.getBgmAgitPaymentAmount()
                        : lastCancel.getCancelAmount(),
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

    /** 실패해도 원래 예외/흐름을 덮지 않도록 삼키는 취소 */
    private void cancelQuietly(String paymentKey, String cancelReason) {
        if (paymentKey == null) {
            return;
        }
        try {
            tossPaymentsClient.cancel(paymentKey, cancelReason);
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
