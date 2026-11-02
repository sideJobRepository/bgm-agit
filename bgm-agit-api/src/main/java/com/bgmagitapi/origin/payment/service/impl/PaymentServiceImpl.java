package com.bgmagitapi.origin.payment.service.impl;

import com.bgmagitapi.origin.advice.exception.PaymentException;
import com.bgmagitapi.origin.advice.exception.ReservationConflictException;
import com.bgmagitapi.origin.advice.exception.TossPaymentApiException;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.entity.BgmAgitReservationChange;
import com.bgmagitapi.origin.entity.BgmAgitRoom;
import com.bgmagitapi.origin.entity.enumeration.ReservationChangeSettleType;
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
import com.bgmagitapi.origin.repository.BgmAgitReservationChangeRepository;
import com.bgmagitapi.origin.repository.BgmAgitReservationRepository;
import com.bgmagitapi.origin.repository.BgmAgitRoomRepository;
import com.bgmagitapi.origin.service.BgmAgitHolidayService;
import com.bgmagitapi.origin.controller.response.reservation.ReservedTimeDto;
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
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

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
    // 주말/공휴일 단가 판정. 주문 생성 때와 같은 기준으로 재계산해야 금액이 갈리지 않는다
    private final BgmAgitHolidayService bgmAgitHolidayService;
    private final ApplicationEventPublisher eventPublisher;
    // 예약 변경(증원) 추가결제 승인 때 변경 요청을 반영한다. 변경 서비스를 부르면 순환 의존이라 리포지토리로 직접 한다
    private final BgmAgitReservationChangeRepository bgmAgitReservationChangeRepository;
    private final BgmAgitRoomRepository bgmAgitRoomRepository;

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    // 토스 clientKey는 공개키(프론트 전달용). secretKey는 STEP 2 승인부터 사용
    @Value("${toss.client-key}")
    private String tossClientKey;

    // 결제 라이브 여부. false(심사 기간)면 결제 성공해도 예약 자동확정을 하지 않는다(공짜 예약 방지).
    @Value("${payment.live:false}")
    private boolean paymentLive;

    @Override
    public PaymentOrderResponse createOrder(Long memberId, Long reservationId, int amount, String orderName,
                                            Integer people, Integer unitPrice, int discountAmount, String paymentKind) {
        BgmAgitMember member = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new PaymentException("존재 하지 않은 회원입니다."));

        // 이미 결제된 예약에 주문을 또 만들지 않는다. 결제창을 두 개 띄우면 둘 다 승인되어 이중 과금이 됐다
        if (bgmAgitPaymentRepository.existsSettledPaymentByReservationId(reservationId)) {
            throw new PaymentException("이미 결제가 완료된 예약입니다.");
        }

        String orderNo = "bgmagit_" + reservationId + "_" + System.currentTimeMillis();

        BgmAgitPayment payment = new BgmAgitPayment(member, reservationId, orderNo, amount, people, unitPrice, discountAmount);
        bgmAgitPaymentRepository.save(payment);

        return new PaymentOrderResponse(orderNo, amount, orderName, tossClientKey, discountAmount, paymentKind);
    }

    @Override
    public PaymentOrderResponse createChangeOrder(Long memberId, Long reservationId, Long changeId, int amount,
                                                  int addPeople, Integer unitPrice, String orderName) {
        BgmAgitMember member = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new PaymentException("존재 하지 않은 회원입니다."));

        // 원결제 중복 차단(existsSettledPaymentByReservationId)을 쓰면 확정 예약이라 늘 막힌다.
        // 추가결제는 변경 요청 단위로 한 번만 받는다
        if (bgmAgitPaymentRepository.existsSettledPaymentByChangeId(changeId)) {
            throw new PaymentException("이미 결제가 완료된 변경 요청입니다.");
        }

        String orderNo = "bgmagit_" + reservationId + "_" + System.currentTimeMillis();
        BgmAgitPayment payment = BgmAgitPayment.changeOrder(member, reservationId, changeId, orderNo, amount, addPeople, unitPrice);
        bgmAgitPaymentRepository.save(payment);

        return new PaymentOrderResponse(orderNo, amount, orderName, tossClientKey, 0, payment.paymentKindName());
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

        // 예약 변경 추가결제는 원결제 검증(이미 결제된 예약 차단·금액 재계산)과 맞지 않아 따로 검증한다
        if (payment.isChangeOrder()) {
            return confirmChangePayment(payment, paymentKey, orderId);
        }

        // 같은 예약에 이미 정산된 결제가 있으면 여기서 끊는다. 멱등성이 orderNo 단위라
        // 결제창을 두 개 띄워 각각 승인하면 예약 하나에 두 번 과금됐다(환불은 최신 1건만 돌았다).
        if (bgmAgitPaymentRepository.existsSettledPaymentByReservationId(payment.getBgmAgitReservationId())) {
            paymentFailureRecorder.recordAborted(orderId, null, "이미 결제가 완료된 예약");
            throw new ReservationConflictException("이미 결제가 완료된 예약입니다. 예약내역에서 확인해 주세요.");
        }

        // 주문을 만든 뒤 인원이 바뀌었으면 저장 금액이 옛 금액이다. READY 주문은 3일간 살아 있어서
        // 며칠 전 열어둔 결제창이 그대로 승인될 수 있다. 승인 전에 서버 재계산값과 다시 맞춰본다.
        validateAmountAgainstReservation(payment);

        // 승인(=과금) 전에 슬롯을 다시 본다. 대기 예약은 서로의 자리를 막지 않기 때문에
        // 여기까지 오는 사이에 같은 시간대가 다른 사람 결제로 확정됐을 수 있다.
        // 돈이 빠져나간 뒤에 알면 환불로 풀어야 하므로 반드시 confirm 앞에서 걸러낸다.
        validateReservationSlotAvailable(payment.getBgmAgitReservationId());

        TossPaymentResponse result = approveWithToss(payment, paymentKey, orderId);

        payment.markDone(
                result.getPaymentKey(),
                result.getMethod(),
                parseDateTime(result.getApprovedAt()),
                result.getReceiptUrl()
        );

        // 심사 기간(payment.live=false)엔 결제행만 DONE 처리하고 예약 자동확정은 하지 않는다.
        // (테스트키라 실입금이 없는데 자동확정되면 공짜 예약이 되므로. 카드사 심사는 결제창 작동만 확인)
        if (paymentLive) {
            approveReservation(payment.getBgmAgitReservationId());
        }
        return toConfirmResponse(payment);
    }

    /**
     * 예약 변경(증원) 추가결제 승인. 검증은 전부 토스 승인(=과금) <b>전에</b> 한다.
     * 승인되는 순간 룸·인원이 바뀐다 — 결제 전에는 아무것도 바꾸지 않고 방도 잡지 않았으므로
     * 그 사이 다른 확정 예약이 들어왔을 수 있어 빈 방 여부를 여기서 다시 본다(원결제 승인 재검증과 같은 기준).
     * 확정 알림톡은 보내지 않는다(이미 확정된 예약이다).
     */
    private PaymentConfirmResponse confirmChangePayment(BgmAgitPayment payment, String paymentKey, String orderId) {
        ChangeTarget target = validateChangeOrder(payment);

        // 예약 반영을 토스 승인(=과금) <b>전에</b> 하고 flush 한다. 방 교체(orphan DELETE/INSERT)가 제약조건에 걸리면
        // 돈이 움직이기 전에 실패해야 한다. 토스 승인이 실패하면 예외로 이 반영까지 같이 롤백된다.
        // 심사 모드(payment.live=false)에선 원결제와 같이 결제행만 DONE 으로 두고 예약은 건드리지 않는다
        if (paymentLive) {
            BgmAgitReservation reservation = target.reservation();
            reservation.replaceRooms(target.newRooms());
            reservation.changePeople(target.change().getBgmAgitAfterPeople());
            target.change().markApplied(payment.getBgmAgitPaymentId(), ReservationChangeSettleType.TOSS);
            bgmAgitReservationChangeRepository.flush();
        }

        TossPaymentResponse result = approveWithToss(payment, paymentKey, orderId);

        payment.markDone(
                result.getPaymentKey(),
                result.getMethod(),
                parseDateTime(result.getApprovedAt()),
                result.getReceiptUrl()
        );
        return toConfirmResponse(payment);
    }

    private record ChangeTarget(BgmAgitReservationChange change, BgmAgitReservation reservation, List<BgmAgitRoom> newRooms) {
    }

    private ChangeTarget validateChangeOrder(BgmAgitPayment payment) {
        String orderId = payment.getBgmAgitOrderNo();
        String expired = "변경 요청이 만료되었습니다. 결제는 진행되지 않았으니 예약내역에서 다시 변경해 주세요.";

        // ABORTED 주문(새 변경 요청·예약 취소로 무효화)은 승인하지 않는다
        if (!payment.isReady()) {
            throw rejectChange(orderId, "추가결제 주문 상태 " + payment.getBgmAgitPaymentStatus(), expired);
        }
        BgmAgitReservationChange change = payment.getBgmAgitReservationChangeId() == null
                ? null
                : bgmAgitReservationChangeRepository.findById(payment.getBgmAgitReservationChangeId()).orElse(null);
        if (change == null || !change.isPending()
                || !Objects.equals(change.getBgmAgitReservationId(), payment.getBgmAgitReservationId())) {
            throw rejectChange(orderId, "변경 요청 없음/만료", expired);
        }

        BgmAgitReservation reservation = bgmAgitReservationRepository
                .findReservationWithRooms(payment.getBgmAgitReservationId()).orElse(null);
        if (reservation == null) {
            throw rejectChange(orderId, "예약 없음", "존재하지 않는 예약입니다.");
        }
        if (reservation.isCanceled()) {
            throw rejectChange(orderId, "취소된 예약", "취소된 예약입니다. 결제는 진행되지 않았습니다.");
        }
        if (!reservation.isApproved()) {
            throw rejectChange(orderId, "확정되지 않은 예약", "확정되지 않은 예약은 추가결제할 수 없습니다. 예약내역에서 다시 확인해 주세요.");
        }
        LocalDateTime useStartAt = reservation.getUseStartAt();
        if (useStartAt == null || !useStartAt.isAfter(LocalDateTime.now(KST))) {
            throw rejectChange(orderId, "이미 시작된 예약", "이미 시작된 예약은 변경할 수 없습니다. 결제는 진행되지 않았습니다.");
        }

        // 요청 이후 예약이 다른 경로(감소·룸 이동·관리자 처리)로 바뀌었으면 옛 기준의 변경을 덮어쓰면 안 된다
        boolean samePeople = Objects.equals(reservation.getBgmAgitReservationPeople(), change.getBgmAgitBeforePeople());
        boolean sameRooms = BgmAgitReservationChange.joinRoomIds(reservation.getRoomIds())
                .equals(change.getBgmAgitBeforeRoomIds());
        if (!samePeople || !sameRooms) {
            throw rejectChange(orderId, "예약 내용이 변경 요청 이후 바뀜", expired);
        }

        if (!Objects.equals(payment.getBgmAgitPaymentAmount(), change.getBgmAgitDiffAmount())) {
            throw rejectChange(orderId,
                    "추가결제 금액 불일치(주문 " + payment.getBgmAgitPaymentAmount() + " / 변경 " + change.getBgmAgitDiffAmount() + ")",
                    expired);
        }

        List<Long> afterIds = change.getAfterRoomIdList();
        List<BgmAgitRoom> newRooms = bgmAgitRoomRepository.findAllById(afterIds).stream()
                .sorted(Comparator.comparing(BgmAgitRoom::getBgmAgitRoomId))
                .toList();
        if (afterIds.isEmpty() || newRooms.size() != afterIds.size()) {
            throw rejectChange(orderId, "변경할 룸 없음", "변경할 룸을 찾을 수 없습니다. 결제는 진행되지 않았습니다.");
        }
        // 방을 그대로 두는 증원이면 지금 방이 숨김이어도 된다. 다른 방으로 옮길 땐 숨김 방 금지(변경 요청 검증과 같은 규칙)
        boolean sameAsCurrent = BgmAgitReservationChange.joinRoomIds(afterIds)
                .equals(BgmAgitReservationChange.joinRoomIds(reservation.getRoomIds()));
        boolean movingToHidden = !sameAsCurrent && newRooms.stream().anyMatch(BgmAgitRoom::isHidden);
        if (movingToHidden) {
            throw rejectChange(orderId, "숨김 룸", "예약이 종료된 룸입니다. 결제는 진행되지 않았으니 다른 룸으로 변경해 주세요.");
        }

        SlotSchedule.Slot mine = reservation.getUseRange();
        boolean taken = bgmAgitReservationRepository
                .findConfirmedReservations(afterIds, reservation.getBgmAgitReservationStartDate(), reservation.getBgmAgitReservationId())
                .stream()
                .map(ReservedTimeDto::toTimeRange)
                .anyMatch(other -> SlotSchedule.isOverlapping(mine.start(), mine.end(), other.getStart(), other.getEnd()));
        if (taken) {
            throw rejectChange(orderId, "변경할 룸에 확정 예약 있음",
                    "선택한 룸에 그 시간대 다른 예약이 확정되었습니다. 결제는 진행되지 않았으니 다른 룸으로 변경해 주세요.");
        }
        return new ChangeTarget(change, reservation, newRooms);
    }

    /** 실패 사유를 별도 트랜잭션으로 남기고 손님용 409 를 만든다 */
    private ReservationConflictException rejectChange(String orderId, String reason, String userMessage) {
        paymentFailureRecorder.recordAborted(orderId, null, "[예약변경] " + reason);
        return new ReservationConflictException(userMessage);
    }

    /**
     * 토스 승인 호출 + 입금 대기(가상계좌) 차단. 실패는 별도 트랜잭션으로 기록하고 던진다.
     * 원결제·추가결제가 같은 경로를 쓴다.
     */
    private TossPaymentResponse approveWithToss(BgmAgitPayment payment, String paymentKey, String orderId) {
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
        return result;
    }

    @Override
    public PaymentRefundResult refundReservation(Long reservationId, int refundRate, String cancelReason) {
        return doRefund(reservationId, bgmAgitPaymentRepository.findRefundablePaymentsForUpdate(reservationId),
                null, refundRate, cancelReason);
    }

    @Override
    public PaymentRefundResult refundPeopleReduction(Long reservationId, int reducedPeople, int refundRate, String cancelReason) {
        List<BgmAgitPayment> payments = bgmAgitPaymentRepository.findRefundablePaymentsForUpdate(reservationId);
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
            log.info("[payment] 인원 축소 환불 스킵. 단가 스냅샷 없음 reservationId={}", reservationId);
            return PaymentRefundResult.nothingToRefund(refundRate);
        }

        return doRefund(reservationId, payments, reducedPeople * unitPrice, refundRate, cancelReason);
    }

    @Override
    public long abortReadyOrders(Long reservationId, String reason) {
        return bgmAgitPaymentRepository.abortReadyOrders(reservationId, reason);
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
    private PaymentRefundResult doRefund(Long reservationId, List<BgmAgitPayment> payments,
                                         Integer baseAmount, int refundRate, String cancelReason) {
        if (payments.isEmpty()) {
            return PaymentRefundResult.noPayment(refundRate);
        }

        int totalRemaining = payments.stream().mapToInt(BgmAgitPayment::remainingAmount).sum();
        int base = baseAmount == null ? totalRemaining : Math.min(baseAmount, totalRemaining);
        int target = ReservationRefundPolicy.refundAmount(base, refundRate);
        if (target <= 0) {
            // 24시간 이내 취소는 환불이 0원이다. 토스에 0원을 보내면 400 이라 아예 부르지 않는다
            log.info("[payment] 환불 대상 금액 없음. reservationId={}, rate={}", reservationId, refundRate);
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
                    payment.getBgmAgitPaymentId(), reservationId, portion, refundRate, cancelReason);

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
                log.error("[payment][환불실패] 관리자 확인 필요. reservationId={}, paymentId={}, amount={}, code={}",
                        reservationId, payment.getBgmAgitPaymentId(), portion, e.getCode(), e);
                return PaymentRefundResult.rejected(refundRate, target, refunded, message);
            } catch (RuntimeException e) {
                paymentCancelRecorder.fail(attempt.getBgmAgitPaymentCancelId(), e.getMessage());
                log.error("[payment][환불실패] 관리자 확인 필요(통신 오류). reservationId={}, paymentId={}, amount={}",
                        reservationId, payment.getBgmAgitPaymentId(), portion, e);
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
    private void validateReservationSlotAvailable(Long reservationId) {
        BgmAgitReservation reservation = bgmAgitReservationRepository.findReservationWithRooms(reservationId)
                .orElseThrow(() -> new ReservationConflictException("존재하지 않는 예약입니다."));
        if (reservation.isCanceled()) {
            throw new ReservationConflictException("취소된 예약입니다.");
        }
        // 주문을 만든 뒤 방이 숨김(운영 종료) 처리됐으면 승인하지 않는다. 주문 생성에서도 막지만 READY 주문은 3일간 살아 있다
        if (reservation.getRoomList().stream().anyMatch(room -> room != null && room.isHidden())) {
            throw new ReservationConflictException("예약이 종료된 항목입니다. 결제는 진행되지 않았으니 매장으로 문의해 주세요.");
        }

        // 회원 1명당 하루 1룸. 등록에서도 막지만 확인→저장 사이에 잠금이 없어 동시에 넣은 두 건이 모두 대기로 들어올 수 있다.
        // 승인은 PaymentConfirmExecutor 로 한 줄로 서므로 여기서 다시 보면 두 번째 결제(=과금)는 막힌다
        if (SlotSchedule.isOneRoomPerDay(reservation.getRoomList(), reservation.getBgmAgitReservationStartDate())
                && bgmAgitReservationRepository.existsOtherApprovedRoomReservation(
                        reservation.getMemberId(), reservation.getBgmAgitReservationStartDate(), reservationId)) {
            throw new ReservationConflictException(
                    "같은 날 이미 확정된 룸 예약이 있습니다. 회원 1명당 하루 1개의 룸만 예약할 수 있어 결제는 진행되지 않았습니다.");
        }

        // 같은 방·같은 영업일의 확정건과 이용 구간이 조금이라도 겹치면 막는다(방별 구간 겹침).
        // 예전처럼 "시작-종료" 문자열이 같은지만 보면 13~17시 확정건 위에 15~18시 결제가 통과한다.
        SlotSchedule.Slot mine = reservation.getUseRange();
        List<Long> roomIds = reservation.getRoomIds();
        boolean taken = bgmAgitReservationRepository
                .findConfirmedReservations(roomIds, reservation.getBgmAgitReservationStartDate(), reservationId)
                .stream()
                .map(ReservedTimeDto::toTimeRange)
                .anyMatch(other -> SlotSchedule.isOverlapping(mine.start(), mine.end(), other.getStart(), other.getEnd()));
        if (taken) {
            throw new ReservationConflictException(
                    "이미 다른 예약이 확정된 시간대입니다. 결제는 진행되지 않았으니 다른 시간대로 예약해 주세요.");
        }
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
        BgmAgitReservation reservation = bgmAgitReservationRepository
                .findReservationWithRooms(payment.getBgmAgitReservationId())
                .orElse(null);
        if (reservation == null) {
            return;
        }
        Integer people = reservation.getBgmAgitReservationPeople();
        LocalDate useDate = reservation.getBgmAgitReservationStartDate();
        // 월간패스 할인은 지금의 패스 여부로 다시 판정하지 않고 주문 때 박아 둔 값을 뺀다.
        // 주문 뒤 1일 초기화·관리자 해제로 패스가 꺼지면 안내받은 금액으로 결제하려는 손님이 승인에서 막힌다
        Integer discount = payment.getBgmAgitPaymentDiscountAmount();
        int expected = SlotSchedule.totalPaymentAmount(
                reservation.getRoomList(),
                people == null ? 0 : people,
                bgmAgitHolidayService.isWeekendRate(useDate),
                useDate,
                reservation.getBgmAgitReservationBungjuPrice()) - (discount == null ? 0 : discount);

        if (!Objects.equals(payment.getBgmAgitPaymentAmount(), expected)) {
            paymentFailureRecorder.recordAborted(payment.getBgmAgitOrderNo(), null,
                    "예약 내용 변경으로 주문 금액 불일치(주문 " + payment.getBgmAgitPaymentAmount() + " / 현재 " + expected + ")");
            throw new PaymentException("예약 인원이 변경되어 결제 금액이 달라졌습니다. 예약내역에서 다시 결제해 주세요.");
        }
    }

    private void approveReservation(Long reservationId) {
        BgmAgitReservation reservation = bgmAgitReservationRepository.findReservationWithRooms(reservationId)
                .orElseThrow(() -> new PaymentException("존재하지 않는 예약입니다."));

        // 예약 1건 = 1행이라 벌크 업데이트 없이 더티체킹으로 확정한다
        reservation.approve();

        ReservationTalkContext ctx = ReservationTalkContext.of("ROLE_ADMIN", reservation);
        eventPublisher.publishEvent(new ReservationTalkEvent(TalkAction.COMPLETE, ctx));
    }

    private PaymentConfirmResponse toConfirmResponse(BgmAgitPayment payment) {
        // 결제 완료 화면의 룸 이용 안내·"하루 1룸" 안내는 11/2 이후 룸 예약에만 맞는 말이라 대상 여부를 같이 내려준다
        BgmAgitReservation reservation = bgmAgitReservationRepository
                .findReservationWithRooms(payment.getBgmAgitReservationId()).orElse(null);
        boolean roomNotice = reservation != null
                && SlotSchedule.isRoomUseNoticeDay(reservation.getRoomList(), reservation.getBgmAgitReservationStartDate());
        boolean oneRoomPerDay = reservation != null
                && SlotSchedule.isOneRoomPerDay(reservation.getRoomList(), reservation.getBgmAgitReservationStartDate());
        return new PaymentConfirmResponse(
                payment.getBgmAgitOrderNo(),
                payment.getBgmAgitReservationId(),
                payment.getBgmAgitPaymentAmount(),
                payment.getBgmAgitPaymentStatus().name(),
                payment.getBgmAgitPaymentType(),
                payment.getBgmAgitPaymentReceiptUrl(),
                roomNotice,
                oneRoomPerDay,
                payment.paymentKindName(),
                reservation == null ? null : reservation.getRoomNames(),
                reservation == null ? null : reservation.getBgmAgitReservationPeople()
        );
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return LocalDateTime.now();
        }
        return OffsetDateTime.parse(value).toLocalDateTime();
    }
}
