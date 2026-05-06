package com.bgmagitapi.advice.exception;

import org.springframework.http.HttpStatus;

public class RefreshTokenInvalidException extends CustomException {

    public RefreshTokenInvalidException(String message) {
        super(message);
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.UNAUTHORIZED;
    }
}
