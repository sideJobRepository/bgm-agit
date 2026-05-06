package com.bgmagitapi.advice.exception;

import org.springframework.http.HttpStatus;

public class RefreshTokenMissingException extends CustomException {

    public RefreshTokenMissingException(String message) {
        super(message);
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.UNAUTHORIZED;
    }
}
