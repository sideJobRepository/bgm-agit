package com.bgmagitapi.origin.advice.exception;

import org.springframework.http.HttpStatus;

/**
 * 결제 처리 중 사용자에게 사유를 그대로 보여줄 수 있는 예외(주문 없음·소유자 불일치·금액 불일치 등).
 *
 * <p>기존에는 {@code RuntimeException} 이라 generic 핸들러를 타서 프론트엔
 * "잠시후 다시 시도해 주세요" 500 으로만 나갔다. 401 은 쓰지 않는다(자동 재시도 → 이중 승인).
 */
public class PaymentException extends CustomException {

    public PaymentException(String message) {
        super(message);
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.BAD_REQUEST;
    }
}
