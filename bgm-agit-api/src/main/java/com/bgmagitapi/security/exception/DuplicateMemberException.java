package com.bgmagitapi.security.exception;

import org.springframework.security.core.AuthenticationException;

/**
 * 같은 휴대폰 번호로 이미 가입된 계정이 있을 때 (소셜 신규 가입 차단).
 * AuthenticationException 을 상속해 실패 핸들러까지 메시지가 그대로 전달되도록 한다.
 */
public class DuplicateMemberException extends AuthenticationException {

    public DuplicateMemberException(String message) {
        super(message);
    }
}
