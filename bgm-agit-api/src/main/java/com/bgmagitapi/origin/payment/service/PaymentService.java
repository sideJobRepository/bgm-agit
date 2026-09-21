package com.bgmagitapi.origin.payment.service;

import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import com.bgmagitapi.origin.payment.controller.response.PaymentConfirmResponse;
import com.bgmagitapi.origin.payment.service.response.PaymentRefundResult;

// 공통 결제 서비스 (도메인 지식 없음 → 재사용). 검증/금액계산은 호출자가 넘긴다.
public interface PaymentService {

    /**
     * 주문 생성: 결제행을 READY로 저장하고 프론트 결제창용 주문정보를 반환.
     * people/unitPrice 는 결제 시점 스냅샷이다 — 환불액을 나중 인원으로 재계산하면 결제액과 어긋난다.
     */
    PaymentOrderResponse createOrder(Long memberId, Long reservationNo, int amount, String orderName,
                                     Integer people, Integer unitPrice);

    PaymentConfirmResponse confirmPayment(String paymentKey, String orderId, Integer amount, Long memberId);

    /** 예약 전체 취소에 따른 환불. 남은 결제 잔액에 비율을 적용한다. */
    PaymentRefundResult refundReservation(Long reservationNo, int refundRate, String cancelReason);

    /**
     * 인원 축소에 따른 차액 환불. 줄어든 인원 × <b>결제 시점 단가</b>에 비율을 적용한다.
     * 지금 단가로 다시 계산하면 예전 요금제로 결제한 건에서 결제액을 넘는 환불 요청이 나간다.
     */
    PaymentRefundResult refundPeopleReduction(Long reservationNo, int reducedPeople, int refundRate, String cancelReason);

    /** 예약의 살아있는 READY 주문을 무효화. 인원이 바뀌면 옛 금액으로 만든 주문은 승인되면 안 된다 */
    long abortReadyOrders(Long reservationNo, String reason);

    // 프론트 결제 실패 콜백(/payments/fail) 기록. 어떤 경우에도 예외를 던지지 않는다
    void recordClientFailure(String orderId, String code, String message, Long memberId);

    // 승인까지 가지 않고 버려진 주문(READY) 정리. 삭제 건수를 반환한다
    long removeAbandonedOrders(int retentionDays);

    // 진단용으로 남긴 실패(ABORTED) 이력 정리. 삭제 건수를 반환한다
    long removeOldAbortedOrders(int retentionDays);
}
