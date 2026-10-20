package com.bgmagitapi.origin.payment.controller.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 주문 생성 응답: 프론트 결제위젯이 결제 요청 시 사용
@Getter
@AllArgsConstructor
public class PaymentOrderResponse {
    // 토스 orderId (서버 발급)
    private String orderId;
    // 결제 금액 (서버 계산)
    private int amount;
    // 주문명 (위젯 표시용)
    private String orderName;
    // 토스 clientKey (프론트 위젯 초기화용, 공개키)
    private String clientKey;
    // 월간패스 본인 1명분 할인액. 없으면 0 (amount 는 이미 할인된 금액)
    private int discountAmount;
    // 결제 성격. LEGACY_DEPOSIT = 10월 이용분 예약금(전날까지 전액환불), DEPOSIT = 마작 대탁 예약금, FULL = 이용요금 전액
    private String paymentKind;
}
