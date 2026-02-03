package com.bgmagitapi.advice;

import com.bgmagitapi.advice.exception.CustomException;
import com.bgmagitapi.advice.exception.ReservationConflictException;
import com.bgmagitapi.advice.exception.ValidException;
import com.bgmagitapi.advice.response.ErrorMessageResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;

@RestControllerAdvice
@Slf4j
public class ExceptionController {
    
    /**
     * 검증 예외 처리
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ErrorMessageResponse exceptionHandler(MethodArgumentNotValidException e) {
        log.info("검증 예외 에러 메시지 ", e);
        BindingResult bindingResult = e.getBindingResult();
        List<FieldError> fieldErrors = bindingResult.getFieldErrors();
        ErrorMessageResponse errorResponse = new ErrorMessageResponse(String.valueOf(HttpStatus.BAD_REQUEST.value()), "잘못된 요청입니다.");
        fieldErrors.forEach(err -> errorResponse.addValidation(err.getField(), err.getDefaultMessage()));
        return errorResponse;
    }
    
    /**
     * 데이터베이스 관련 예외 처리
     */
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(DataAccessException.class)
    public ErrorMessageResponse handleDatabaseException(DataAccessException e) {
        log.info("데이터베이스 예외 ", e);
        return new ErrorMessageResponse(
                String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()),
                "데이터베이스 오류가 발생했습니다."
        );
    }
    
    /**
     * NullPointerException 등 예기치 않은 예외 처리
     */
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public ErrorMessageResponse handleGeneralException(Exception e) {
        log.info("서버 예외 발생", e);
        return new ErrorMessageResponse(
                String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()),
                "잠시후 다시 시도해 주세요"
        );
    }
    
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(CustomException.class)
    public ErrorMessageResponse handleRefreshTokenExpiredExceptionException(CustomException e) {
        log.info("공통 예외 ", e);
        return new ErrorMessageResponse(
                String.valueOf(HttpStatus.UNAUTHORIZED.value()),
                e.getMessage()
        );
    }
    
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(NoResourceFoundException.class)
    public ErrorMessageResponse handleNoResourceFoundException(NoResourceFoundException e) {
        log.info("404 {}", e.getMessage());
        return new ErrorMessageResponse(
                String.valueOf(HttpStatus.NOT_FOUND.value()),
                e.getMessage()
        );
    }
    
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(ValidException.class)
    public ErrorMessageResponse customException(ValidException e) {
        log.info("공통 예외 ", e);
        return new ErrorMessageResponse(String.valueOf(e.getStatus()), e.getMessage());
    }
}
