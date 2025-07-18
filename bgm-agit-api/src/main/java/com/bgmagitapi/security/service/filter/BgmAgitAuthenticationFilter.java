package com.bgmagitapi.security.service.filter;

import com.bgmagitapi.security.service.social.SocialLoginUrl;
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
        super(new AntPathRequestMatcher(null, "POST"));
//        super(new OrRequestMatcher(
//                new AntPathRequestMatcher("/bgm-agit/kakao-login", "POST"),
//                new AntPathRequestMatcher("/bgm-agit/naver-login", "POST"),
//                new AntPathRequestMatcher("/bgm-agit/google-login", "POST")
//        ));
    }
    
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException, IOException, ServletException {
        
        String uri = request.getRequestURI();
        
        SocialLoginUrl socialLoginUrl = SocialLoginUrl.getByPath(uri)
                .orElseThrow(() -> new ServletException("Social Login URL not found"));
        
        switch (socialLoginUrl) {
            case KAKAO -> {
                System.out.println("Kakao Login");
                return this.getAuthenticationManager().authenticate(null);
            }
            case NAVER -> {
                System.out.println("NAVER Login");
                return this.getAuthenticationManager().authenticate(null);
            }
            case GOOGLE -> {
                System.out.println("GOOGLE Login");
                return this.getAuthenticationManager().authenticate(null);
            }
            default -> throw new AuthenticationServiceException("Unsupported login type: " + socialLoginUrl);
        }
    }
}
