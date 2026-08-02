package com.bgmagitapi.kml.rating.exception;

import com.bgmagitapi.origin.advice.exception.CustomException;
import org.springframework.http.HttpStatus;

public class MultipleOngoingSeasonException extends CustomException {

    public MultipleOngoingSeasonException() {
        super("진행중인 시즌이 여러개입니다.");
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
