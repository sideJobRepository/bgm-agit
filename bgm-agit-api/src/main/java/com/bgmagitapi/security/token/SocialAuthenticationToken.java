package com.bgmagitapi.security.token;

import com.bgmagitapi.security.service.social.SocialLoginUrl;
import lombok.Getter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

@Getter
public class SocialAuthenticationToken extends AbstractAuthenticationToken {
    
    private final Object principal;
    private final SocialLoginUrl socialLoginUrl;
    private final Object credentials;
    
    public SocialAuthenticationToken(String principal, SocialLoginUrl socialLoginUrl) {
        super(null);
        this.principal = principal;
        this.socialLoginUrl = socialLoginUrl;
        this.credentials = null;
        setAuthenticated(false);
    }
    
    public SocialAuthenticationToken(Object principal, SocialLoginUrl socialLoginUrl, Object credentials, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.principal = principal;
        this.socialLoginUrl = socialLoginUrl;
        this.credentials = credentials;
        setAuthenticated(true);
    }
    
    @Override
    public Object getCredentials() {
        return this.credentials;
    }
    
    @Override
    public Object getPrincipal() {
        return this.principal;
    }
    
    
}

