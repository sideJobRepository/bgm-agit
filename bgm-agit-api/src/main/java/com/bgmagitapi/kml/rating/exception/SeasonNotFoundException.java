package com.bgmagitapi.kml.rating.exception;

import com.bgmagitapi.origin.advice.exception.CustomException;
import org.springframework.http.HttpStatus;

public class SeasonNotFoundException extends CustomException {

    public SeasonNotFoundException(String message) {
        super(message);
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
