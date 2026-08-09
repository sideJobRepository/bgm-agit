package com.bgmagitapi.origin.advice;

import com.bgmagitapi.origin.advice.exception.CustomException;
import com.bgmagitapi.origin.advice.exception.ReservationConflictException;
import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.advice.response.ErrorMessageResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    
    /**
     * 공통 예외. 상태코드는 예외가 스스로 정한 값을 따른다.
     * (리프레시 토큰류는 401, 예약 충돌은 409. 전부 401로 내보내면 프론트 인터셉터가
     * 토큰 갱신 후 요청을 재시도해서 결제 승인 같은 건 두 번 날아간다)
     */
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorMessageResponse> handleRefreshTokenExpiredExceptionException(CustomException e) {
        log.info("공통 예외 ", e);
        HttpStatus status = e.getStatus() != null ? e.getStatus() : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status)
                .body(new ErrorMessageResponse(String.valueOf(status.value()), e.getMessage()));
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
