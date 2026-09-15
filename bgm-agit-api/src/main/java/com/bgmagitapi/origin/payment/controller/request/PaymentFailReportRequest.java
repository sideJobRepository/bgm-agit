package com.bgmagitapi.origin.payment.controller.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 프론트 결제 실패 페이지(/payment/fail)가 보내는 실패 리포트.
 * 토스가 리다이렉트 쿼리로 준 code/message 를 그대로 전달받는다(둘 다 없을 수 있음).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentFailReportRequest {

    @NotBlank(message = "orderId is required")
    private String orderId;

    private String code;

    private String message;
}
