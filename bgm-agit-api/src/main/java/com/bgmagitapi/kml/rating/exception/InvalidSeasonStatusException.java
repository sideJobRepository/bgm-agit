package com.bgmagitapi.kml.rating.exception;

import com.bgmagitapi.origin.advice.exception.CustomException;
import org.springframework.http.HttpStatus;

public class InvalidSeasonStatusException extends CustomException {

    public InvalidSeasonStatusException(String message) {
        super(message);
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.BAD_REQUEST;
    }
}
