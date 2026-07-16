package com.bgmagitapi.origin.payment.service.impl;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.event.dto.ReservationTalkEvent;
import com.bgmagitapi.origin.event.dto.TalkAction;
import com.bgmagitapi.origin.payment.controller.response.PaymentConfirmResponse;
import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import com.bgmagitapi.origin.payment.entity.BgmAgitPayment;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentStatus;
import com.bgmagitapi.origin.payment.repository.BgmAgitPaymentRepository;
import com.bgmagitapi.origin.payment.service.PaymentService;
import com.bgmagitapi.origin.payment.service.TossPaymentsClient;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import com.bgmagitapi.origin.repository.BgmAgitReservationRepository;
import com.bgmagitapi.origin.service.response.BizTalkCancel;
import com.bgmagitapi.origin.service.response.ReservationTalkContext;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    private final BgmAgitPaymentRepository bgmAgitPaymentRepository;
    private final BgmAgitReservationRepository bgmAgitReservationRepository;
    private final TossPaymentsClient tossPaymentsClient;
    private final ApplicationEventPublisher eventPublisher;

    // 토스 clientKey는 공개키(프론트 전달용). secretKey는 STEP 2 승인부터 사용
    @Value("${toss.client-key}")
    private String tossClientKey;

    @Override
    public PaymentOrderResponse createOrder(Long memberId, Long reservationNo, int amount, String orderName) {
        BgmAgitMember member = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("존재 하지 않은 회원입니다."));
        
        String orderNo = "bgmagit_" + reservationNo + "_" + System.currentTimeMillis();

        BgmAgitPayment payment = new BgmAgitPayment(member, reservationNo, orderNo, amount);
        bgmAgitPaymentRepository.save(payment);

        return new PaymentOrderResponse(orderNo, amount, orderName, tossClientKey);
    }

    @Override
    public PaymentConfirmResponse confirmPayment(String paymentKey, String orderId, Integer amount, Long memberId) {
        BgmAgitPayment payment = bgmAgitPaymentRepository.findByBgmAgitOrderNo(orderId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 주문입니다."));

        validatePaymentOwner(payment, memberId);
        validateAmount(payment, amount);

        if (payment.isDone()) {
            return toConfirmResponse(payment);
        }

        JsonNode result;
        try {
            result = tossPaymentsClient.confirm(paymentKey, orderId, amount);
        } catch (RuntimeException e) {
            payment.markAborted(e.getMessage());
            throw e;
        }

        payment.markDone(
                text(result, "paymentKey"),
                text(result, "method"),
                parseDateTime(text(result, "approvedAt")),
                result.path("receipt").path("url").asText(null)
        );

        approveReservation(payment.getBgmAgitReservationNo());
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

        JsonNode result = tossPaymentsClient.cancel(payment.getBgmAgitPaymentKey(), cancelReason);
        JsonNode lastCancel = last(result.path("cancels"));
        payment.markCanceled(
                lastCancel.path("cancelAmount").isMissingNode() ? payment.getBgmAgitPaymentAmount() : lastCancel.path("cancelAmount").asInt(),
                lastCancel.path("cancelReason").asText(cancelReason),
                parseDateTime(lastCancel.path("canceledAt").asText(null))
        );
    }

    private void validatePaymentOwner(BgmAgitPayment payment, Long memberId) {
        Long paymentMemberId = payment.getBgmAgitMember().getBgmAgitMemberId();
        if (!Objects.equals(paymentMemberId, memberId)) {
            throw new RuntimeException("본인의 결제 주문이 아닙니다.");
        }
    }

    private void validateAmount(BgmAgitPayment payment, Integer amount) {
        if (!Objects.equals(payment.getBgmAgitPaymentAmount(), amount)) {
            payment.markAborted("결제 금액이 일치하지 않습니다.");
            throw new RuntimeException("결제 금액이 일치하지 않습니다.");
        }
    }

    private void approveReservation(Long reservationNo) {
        List<BgmAgitReservation> reservations = bgmAgitReservationRepository.findReservationList(reservationNo);
        if (reservations.isEmpty()) {
            throw new RuntimeException("존재하지 않는 예약입니다.");
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

    private String text(JsonNode node, String field) {
        return node == null ? null : node.path(field).asText(null);
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return LocalDateTime.now();
        }
        return OffsetDateTime.parse(value).toLocalDateTime();
    }

    private JsonNode last(JsonNode array) {
        if (array == null || !array.isArray() || array.isEmpty()) {
            return com.fasterxml.jackson.databind.node.MissingNode.getInstance();
        }
        return array.get(array.size() - 1);
    }
}
