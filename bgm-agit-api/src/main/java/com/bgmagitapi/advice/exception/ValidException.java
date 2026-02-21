package com.bgmagitapi.advice.exception;

import org.springframework.http.HttpStatus;

public class ValidException extends CustomException {
    
    public ValidException(String message) {
        super(message);
    }
    @Override
    public HttpStatus getStatus() {
        return HttpStatus.BAD_REQUEST;
    }
}
