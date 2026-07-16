package com.bgmagitapi.origin.security.exception;

import org.springframework.security.core.AuthenticationException;

/**
 * 가입되지 않은 소셜 계정으로 로그인 시도할 때 (신규 소셜 회원가입 차단).
 * 소셜 로그인은 기존 가입 회원만 이용 가능하며, 신규 회원은 자체 회원가입을 이용해야 한다.
 * AuthenticationException 을 상속해 실패 핸들러까지 메시지가 그대로 전달되도록 한다.
 */
public class SocialLoginNotAllowedException extends AuthenticationException {

    public SocialLoginNotAllowedException(String message) {
        super(message);
    }
}
