package com.bgmagitapi.security.filter;

import com.bgmagitapi.security.service.request.FormLoginRequest;
import com.bgmagitapi.security.service.request.SocialAuthenticationRequest;
import com.bgmagitapi.security.service.social.SocialLoginUrl;
import com.bgmagitapi.security.token.FormAuthenticationToken;
import com.bgmagitapi.security.token.SocialAuthenticationToken;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;

import java.io.IOException;

public class BgmAgitAuthenticationFilter extends AbstractAuthenticationProcessingFilter {

    public static final String FORM_LOGIN_PATH = "/bgm-agit/next/login";
    // 메인사이트(bgm-agit-front) 자체로그인 경로. /next/login 과 동일한 폼 인증을 쓰되,
    // 성공 핸들러가 URI로 쿠키 이름을 구분하므로 이 경로는 refreshToken_main 쿠키를 받는다.
    public static final String MAIN_FORM_LOGIN_PATH = "/bgm-agit/login";

    public BgmAgitAuthenticationFilter() {
        super(new OrRequestMatcher(
                new AntPathRequestMatcher("/bgm-agit/kakao-login", "POST"),
                new AntPathRequestMatcher("/bgm-agit/naver-login", "POST"),
                new AntPathRequestMatcher(FORM_LOGIN_PATH, "POST"),
                new AntPathRequestMatcher(MAIN_FORM_LOGIN_PATH, "POST")
        ));
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException, IOException, ServletException {
        String uri = request.getRequestURI();
        ObjectMapper objectMapper = new ObjectMapper();

        if (FORM_LOGIN_PATH.equals(uri) || MAIN_FORM_LOGIN_PATH.equals(uri)) {
            FormLoginRequest loginRequest = objectMapper.readValue(request.getReader(), FormLoginRequest.class);
            if (loginRequest.getNickname() == null || loginRequest.getNickname().isBlank()
                    || loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()) {
                throw new AuthenticationServiceException("닉네임과 비밀번호를 입력해 주세요.");
            }
            FormAuthenticationToken token = new FormAuthenticationToken(
                    loginRequest.getNickname().trim(),
                    loginRequest.getPassword()
            );
            return this.getAuthenticationManager().authenticate(token);
        }

        SocialAuthenticationRequest loginRequest = objectMapper.readValue(request.getReader(), SocialAuthenticationRequest.class);
        if (loginRequest.getCode() == null || loginRequest.getCode().isBlank()) {
            throw new AuthenticationServiceException("code 값이 없습니다.");
        }
        SocialAuthenticationToken authRequest = new SocialAuthenticationToken(
                loginRequest.getCode(),
                SocialLoginUrl.getSocialType(uri)
        );

        return this.getAuthenticationManager().authenticate(authRequest);
    }
}
