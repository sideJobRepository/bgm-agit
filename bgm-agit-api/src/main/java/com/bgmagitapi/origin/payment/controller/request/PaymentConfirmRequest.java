package com.bgmagitapi.origin.payment.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmRequest {

    @NotBlank(message = "paymentKey is required")
    private String paymentKey;

    @NotBlank(message = "orderId is required")
    private String orderId;

    @NotNull(message = "amount is required")
    private Integer amount;
}
