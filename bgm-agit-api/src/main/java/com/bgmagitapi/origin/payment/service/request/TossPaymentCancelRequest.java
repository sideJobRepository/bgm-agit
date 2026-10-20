package com.bgmagitapi.origin.payment.service.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 토스 결제 취소 요청 바디.
 *
 * cancelAmount 를 빼면 토스는 전액취소로 처리한다. 그래서 null 일 때 아예 직렬화되지 않도록
 * NON_NULL 을 건다 — 0 이나 빈 값이 나가면 400 이 떨어진다.
 */
@Getter
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TossPaymentCancelRequest {
    private String cancelReason;
    private Integer cancelAmount;
}
