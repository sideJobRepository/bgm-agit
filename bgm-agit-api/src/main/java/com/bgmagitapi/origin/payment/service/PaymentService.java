package com.bgmagitapi.origin.payment.service;

import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;

// 공통 결제 서비스 (도메인 지식 없음 → 재사용). 검증/금액계산은 호출자가 넘긴다.
public interface PaymentService {

    // 주문 생성: 결제행을 READY로 저장하고 프론트 결제위젯용 주문정보를 반환
    PaymentOrderResponse createOrder(Long memberId, Long reservationNo, int amount, String orderName);
}
