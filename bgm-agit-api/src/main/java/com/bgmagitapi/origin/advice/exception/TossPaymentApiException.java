package com.bgmagitapi.origin.advice.exception;

import org.springframework.http.HttpStatus;

/**
 * 토스 결제 API 가 4xx/5xx 로 거절한 경우.
 *
 * <p>상태코드는 <b>400 고정</b>. 401 로 내보내면 프론트 axios 인터셉터가 토큰을 갱신한 뒤
 * 요청을 자동 재시도해서 결제 승인이 두 번 날아간다.
 */
public class TossPaymentApiException extends CustomException {

    // 토스 에러 코드 (바디 파싱 실패 시 null)
    private final String code;

    public TossPaymentApiException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.BAD_REQUEST;
    }
}
