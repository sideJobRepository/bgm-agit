package com.bgmagitapi.origin.payment.service;

import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import com.bgmagitapi.origin.payment.controller.response.PaymentConfirmResponse;

// 공통 결제 서비스 (도메인 지식 없음 → 재사용). 검증/금액계산은 호출자가 넘긴다.
public interface PaymentService {

    // 주문 생성: 결제행을 READY로 저장하고 프론트 결제위젯용 주문정보를 반환
    PaymentOrderResponse createOrder(Long memberId, Long reservationNo, int amount, String orderName);

    PaymentConfirmResponse confirmPayment(String paymentKey, String orderId, Integer amount, Long memberId);

    void cancelDonePaymentByReservationNo(Long reservationNo, String cancelReason);

    // 프론트 결제 실패 콜백(/payments/fail) 기록. 어떤 경우에도 예외를 던지지 않는다
    void recordClientFailure(String orderId, String code, String message, Long memberId);

    // 승인까지 가지 않고 버려진 주문(READY) 정리. 삭제 건수를 반환한다
    long removeAbandonedOrders(int retentionDays);

    // 진단용으로 남긴 실패(ABORTED) 이력 정리. 삭제 건수를 반환한다
    long removeOldAbortedOrders(int retentionDays);
}
