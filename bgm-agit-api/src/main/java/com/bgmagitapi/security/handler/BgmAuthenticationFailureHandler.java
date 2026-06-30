package com.bgmagitapi.security.handler;

import com.bgmagitapi.advice.response.ErrorMessageResponse;
import com.bgmagitapi.security.exception.DuplicateMemberException;
import com.bgmagitapi.security.exception.SocialLoginNotAllowedException;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
@Component("bgmAuthenticationFailureHandler")
@RequiredArgsConstructor
public class BgmAuthenticationFailureHandler implements AuthenticationFailureHandler {
    
    private final ObjectMapper mapper;
    
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException {
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");
        String message;
        if (exception instanceof DuplicateMemberException) {
            // 동일 휴대폰 번호로 이미 가입된 계정이 있는 경우: 안내 메시지 그대로 전달
            message = exception.getMessage();
        } else if (exception instanceof SocialLoginNotAllowedException) {
            // 가입되지 않은 소셜 계정으로 로그인 시도: 안내 메시지 그대로 전달
            message = exception.getMessage();
        } else if (exception instanceof UsernameNotFoundException) {
            message = "사용자 정보가 존재하지 않습니다.";
        } else {
            message = "인증에 실패하였습니다.";
        }
        
        ErrorMessageResponse errorResponse = new ErrorMessageResponse("400", message);
        mapper.writeValue(response.getWriter(), errorResponse);
    }
}
