package com.bgmagitapi.kml.rating.exception;

import com.bgmagitapi.origin.advice.exception.CustomException;
import org.springframework.http.HttpStatus;

public class OngoingSeasonExistsException extends CustomException {

    public OngoingSeasonExistsException() {
        super("이미 진행중인 시즌이 있어 시즌을 시작할 수 없습니다.");
    }

    @Override
    public HttpStatus getStatus() {
        return HttpStatus.BAD_REQUEST;
    }
}
