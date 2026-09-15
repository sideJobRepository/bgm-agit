package com.bgmagitapi.origin.payment.service.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 토스 결제 API 에러 바디.
 * 4xx/5xx 응답은 {@code {"code":"...", "message":"..."}} 형태로 내려온다.
 * RestClient 기본 예외에 맡기면 이 두 값이 버려져서 실패 사유를 남길 수 없다.
 */
@Getter
@NoArgsConstructor
public class TossErrorResponse {
    // 토스 에러 코드 (예: NOT_FOUND_PAYMENT_SESSION, REJECT_CARD_COMPANY)
    private String code;
    // 토스가 내려준 사유 문자열
    private String message;
}
