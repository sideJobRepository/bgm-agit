package com.bgmagitapi.security.handler;


import com.bgmagitapi.entity.BgmAgitMember;
//import com.bgmagitapi.security.jwt.MacSecuritySigner;
import com.bgmagitapi.security.jwt.RsaSecuritySigner;
import com.bgmagitapi.security.token.SocialAuthenticationToken;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWK;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component(value = "bgmAgitAuthenticationSuccessHandler")
@RequiredArgsConstructor
public class BgmAgitAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    
    private final ObjectMapper objectMapper;
    //private final MacSecuritySigner macSecuritySigner;
    private final RsaSecuritySigner rsaSecuritySigner;
    private final JWK jwk;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        SocialAuthenticationToken token = (SocialAuthenticationToken) authentication;
        BgmAgitMember member = (BgmAgitMember) token.getPrincipal();
        
        List<GrantedAuthority> authorities = (List<GrantedAuthority>) token.getAuthorities();
        
        
        String jwt = null;
        try {
            jwt = rsaSecuritySigner.getToken(member,jwk,authorities);
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
        
        Map<String, Object> result = Map.of(
                "user", member,
                "token", jwt
        );
        
        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}
