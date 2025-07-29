package com.bgmagitapi.security;

import com.bgmagitapi.security.filter.BgmAgitAuthenticationFilter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.HttpSecurityBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractAuthenticationFilterConfigurer;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

public class BgmAgitSecurityDsl<H extends HttpSecurityBuilder<H>> extends AbstractAuthenticationFilterConfigurer<H, BgmAgitSecurityDsl<H>, BgmAgitAuthenticationFilter> {
    
    
    private AuthenticationSuccessHandler successHandler;
    private AuthenticationFailureHandler failureHandler;
    
    private static final RequestMatcher LOGIN_MATCHER = new OrRequestMatcher(
            new AntPathRequestMatcher("/bgm-agit/kakao-login", "POST"),
            new AntPathRequestMatcher("/bgm-agit/naver-login", "POST"),
            new AntPathRequestMatcher("/bgm-agit/google-login", "POST")
    );
    
    
    public BgmAgitSecurityDsl() {
        super(new BgmAgitAuthenticationFilter(),null);
    }
    

    
    @Override
    public void init(H http) throws Exception {
        super.init(http);
    }
    
    
    @Override
    public void configure(H http) throws Exception {
        
        AuthenticationManager authenticationManager = http.getSharedObject(AuthenticationManager.class);
        getAuthenticationFilter().setAuthenticationManager(authenticationManager);
        getAuthenticationFilter().setAuthenticationSuccessHandler(successHandler);
        getAuthenticationFilter().setAuthenticationFailureHandler(failureHandler);
        SessionAuthenticationStrategy sessionAuthenticationStrategy = http.getSharedObject(SessionAuthenticationStrategy.class);
        if(sessionAuthenticationStrategy != null) {
            getAuthenticationFilter().setSessionAuthenticationStrategy(sessionAuthenticationStrategy);
        }
        http.setSharedObject(BgmAgitAuthenticationFilter.class,getAuthenticationFilter());
        http.addFilterBefore(getAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
    }
    
    public BgmAgitSecurityDsl<H> bgmAgitSuccessHandler(AuthenticationSuccessHandler successHandler) {
        this.successHandler = successHandler;
        return this;
    }
    
    public BgmAgitSecurityDsl<H> bgmAgitFailureHandler(AuthenticationFailureHandler authenticationFailureHandler) {
        this.failureHandler = authenticationFailureHandler;
        return this;
    }
    /**
     * 세션을 사용하지않음
     * @param loginProcessingUrl creates the {@link RequestMatcher} based upon the
     * loginProcessingUrl
     * @return
     */
//    public BgmAgitSecurityDsl<H> setSecurityContextRepository(SecurityContextRepository securityContextRepository) {
//        return super.securityContextRepository(securityContextRepository);
//    }
    @Override
    protected RequestMatcher createLoginProcessingUrlMatcher(String loginProcessingUrl) {
        return LOGIN_MATCHER;
    }
    
}
