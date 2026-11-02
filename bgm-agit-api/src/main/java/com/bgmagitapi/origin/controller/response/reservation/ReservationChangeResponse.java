package com.bgmagitapi.origin.controller.response.reservation;

import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 예약 변경 결과.
 * applied=true 면 이미 반영됨(order=null). 확정 예약 증원이면 applied=false + order(paymentKind=CHANGE) —
 * 추가결제가 승인되는 순간 반영된다. 바꿀 게 없으면 applied=false, order=null.
 */
@Getter
@AllArgsConstructor
public class ReservationChangeResponse {
    private boolean applied;
    private String message;
    private PaymentOrderResponse order;
}
