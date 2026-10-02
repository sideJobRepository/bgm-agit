package com.bgmagitapi.origin.advice.exception;

import org.springframework.http.HttpStatus;

// 403. 401 로 내보내면 프론트 axios 가 토큰을 갱신하고 같은 요청을 다시 보낸다
public class ForbiddenException extends CustomException {

    public ForbiddenException(String message) {
        super(message);
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.FORBIDDEN;
    }
}
