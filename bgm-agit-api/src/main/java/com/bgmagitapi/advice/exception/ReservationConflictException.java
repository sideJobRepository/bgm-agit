package com.bgmagitapi.advice.exception;

import org.springframework.http.HttpStatus;

public class ReservationConflictException extends CustomException{
    
    public ReservationConflictException(String message) {
        super(message);
    }
    
    @Override
    public HttpStatus getStatus() {
        return HttpStatus.CONFLICT;
    }
}
