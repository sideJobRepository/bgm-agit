package com.bgmagitapi.security.handler;


import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.security.jwt.RsaSecuritySigner;
import com.bgmagitapi.security.token.SocialAuthenticationToken;
import com.bgmagitapi.service.BgmAgitRefreshTokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWK;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component(value = "bgmAgitAuthenticationSuccessHandler")
@RequiredArgsConstructor
public class BgmAgitAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    
    private final ObjectMapper objectMapper;
    private final RsaSecuritySigner rsaSecuritySigner;
    private final BgmAgitRefreshTokenService bgmAgitRefreshTokenService;
    private final JWK jwk;
    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 1;
    //private final MacSecuritySigner macSecuritySigner;
    @Value("${cookie.secure}")
    private boolean secure;

    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        SocialAuthenticationToken token = (SocialAuthenticationToken) authentication;
        BgmAgitMember member = (BgmAgitMember) token.getPrincipal();
        List<GrantedAuthority> authorities = (List<GrantedAuthority>) token.getAuthorities();
        
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(1);
        
        try {
            TokenPair tokenPair = rsaSecuritySigner.getToken(member, jwk, authorities);
            bgmAgitRefreshTokenService.refreshTokenSaveOrUpdate(member, tokenPair.getRefreshToken(), expiresAt);
            
            // Access Token은 응답 JSON에 포함
            Map<String, Object> result = Map.of(
                    "user", member,
                    "token", tokenPair.getAccessToken()
            );
            
            // Refresh Token은 HttpOnly 쿠키로 설정
            ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokenPair.getRefreshToken())
                    .httpOnly(true)
                    .secure(secure) // 로컬일 경우 secure=false
                    .path("/")
                    .maxAge(Duration.ofDays(1))
                    .sameSite("Strict")
                    .build();
            response.addHeader("Set-Cookie", refreshCookie.toString());
            
            response.setContentType("application/json");
            response.getWriter().write(objectMapper.writeValueAsString(result));
        } catch (JOSEException e) {
            throw new RuntimeException("JWT 생성 실패", e);
        }
    }
}
