package com.bgmagitapi.kml.rating.exception;

import com.bgmagitapi.origin.advice.exception.CustomException;
import org.springframework.http.HttpStatus;

public class MatchsNotFoundException extends CustomException {

    public MatchsNotFoundException(String message) {
        super(message);
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
