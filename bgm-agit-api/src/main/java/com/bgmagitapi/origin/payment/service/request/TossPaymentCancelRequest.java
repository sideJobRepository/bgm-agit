package com.bgmagitapi.origin.payment.service.request;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TossPaymentCancelRequest {
    private String cancelReason;
}
