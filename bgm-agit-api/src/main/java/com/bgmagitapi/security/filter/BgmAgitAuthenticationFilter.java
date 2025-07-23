package com.bgmagitapi.security.filter;

import com.bgmagitapi.security.service.request.SocialAuthenticationRequest;
import com.bgmagitapi.security.service.social.SocialLoginUrl;
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

public class BgmAgitAuthenticationFilter  extends AbstractAuthenticationProcessingFilter {
    
    
    public BgmAgitAuthenticationFilter() {
        super(new OrRequestMatcher(
                new AntPathRequestMatcher("/bgm-agit/kakao-login", "POST"),
                new AntPathRequestMatcher("/bgm-agit/naver-login", "POST"),
                new AntPathRequestMatcher("/bgm-agit/google-login", "POST")
        ));
    }
    
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException, IOException, ServletException {
        
        String uri = request.getRequestURI();
        
        SocialLoginUrl socialLoginUrl = SocialLoginUrl.getByPath(uri)
                .orElseThrow(() -> new ServletException("Social Login URL not found"));
        
        ObjectMapper objectMapper = new ObjectMapper();
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
