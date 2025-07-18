package com.bgmagitapi.security;

import com.bgmagitapi.security.service.filter.BgmAgitAuthenticationFilter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.HttpSecurityBuilder;
import org.springframework.security.config.annotation.web.configurers.AbstractAuthenticationFilterConfigurer;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

public class BgmAgitSecurityDsl<H extends HttpSecurityBuilder<H>> extends AbstractAuthenticationFilterConfigurer<H, BgmAgitSecurityDsl<H>, BgmAgitAuthenticationFilter> {
    
    
    private AuthenticationSuccessHandler successHandler;
    private AuthenticationFailureHandler failureHandler;
    private AuthenticationEntryPoint entryPoint;
    
    
    
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
        SessionAuthenticationStrategy sessionAuthenticationStrategy = http.getSharedObject(SessionAuthenticationStrategy.class);
        if(sessionAuthenticationStrategy != null) {
            getAuthenticationFilter().setSessionAuthenticationStrategy(sessionAuthenticationStrategy);
        }
        http.setSharedObject(BgmAgitAuthenticationFilter.class,getAuthenticationFilter());
        http.addFilterBefore(getAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
    }
    
    public BgmAgitSecurityDsl<H> chamKaKaoSuccessHandler(AuthenticationSuccessHandler successHandler) {
        this.successHandler = successHandler;
        return this;
    }
    
    public BgmAgitSecurityDsl<H> chamKaKaoFailureHandler(AuthenticationFailureHandler authenticationFailureHandler) {
        this.failureHandler = authenticationFailureHandler;
        return this;
    }
    
    public BgmAgitSecurityDsl<H> chamKaKaoEntryPoint(AuthenticationEntryPoint authenticationEntryPoint) {
        this.entryPoint = authenticationEntryPoint;
        return this;
    }
    
    @Override
    protected RequestMatcher createLoginProcessingUrlMatcher(String loginProcessingUrl) {
        return request -> false;
    }
}
