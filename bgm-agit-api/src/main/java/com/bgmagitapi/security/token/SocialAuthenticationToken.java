package com.bgmagitapi.security.token;

import lombok.Getter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

@Getter
public class SocialAuthenticationToken extends AbstractAuthenticationToken {
    
    private final String provider;
    private final String authorizeCode;
    private final Object principal;
    private final Object credentials;
    
    public SocialAuthenticationToken(String provider, String authorizeCode) {
        super(null);
        this.provider = provider;
        this.authorizeCode = authorizeCode;
        this.principal = null;
        this.credentials = null;
        setAuthenticated(false);
    }
    
    public SocialAuthenticationToken(Object principal, Object credentials, String provider, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.principal = principal;
        this.credentials = credentials;
        this.provider = provider;
        this.authorizeCode = null;
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

