package com.bgmagitapi.origin.payment.controller.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentConfirmResponse {
    private String orderId;
    private Long reservationNo;
    private Integer amount;
    private String status;
    private String method;
    private String receiptUrl;
}
