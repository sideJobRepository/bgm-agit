package com.bgmagitapi.origin.security.handler;


import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.security.dto.BgmAgitMemberResponseDto;
import com.bgmagitapi.origin.security.jwt.RsaSecuritySigner;
import com.bgmagitapi.origin.service.BgmAgitRefreshTokenService;
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

    public static final String COOKIE_NAME_MAIN = "refreshToken_main";
    public static final String COOKIE_NAME_RECORD = "refreshToken_record";

    /**
     * 리프레시 토큰 DB 행의 기기 키. 메인과 /record 는 같은 도메인이라 localStorage deviceId 가 같아서,
     * 그대로 쓰면 한쪽에서 토큰을 갱신할 때 다른 쪽 쿠키의 토큰이 무효가 돼 새로고침하면 로그아웃됐다.
     * 메인은 기존 행을 살리려고 deviceId 그대로 두고 /record 만 접미사를 붙인다.
     */
    public static String platformIdOf(String deviceId, boolean record) {
        if (deviceId == null || deviceId.isBlank()) return deviceId;
        return record ? deviceId + ":record" : deviceId;
    }

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
        BgmAgitMember member = (BgmAgitMember) authentication.getPrincipal();
        @SuppressWarnings("unchecked")
        List<GrantedAuthority> authorities = (List<GrantedAuthority>) authentication.getAuthorities();
        
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(1);
        
        String deviceId = request.getHeader("X-Device-Id");
        if (deviceId == null || deviceId.isBlank()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json; charset=UTF-8");
            response.getWriter().write("{\"message\":\"디바이스 식별자가 없습니다.\"}");
            return;
        }

        try {
            TokenPair tokenPair = rsaSecuritySigner.getToken(member, jwk, authorities);
            boolean record = "/bgm-agit/next/login".equals(request.getRequestURI());
            bgmAgitRefreshTokenService.refreshTokenSaveOrUpdate(member, tokenPair.getRefreshToken(), expiresAt, platformIdOf(deviceId, record));
            
            BgmAgitMemberResponseDto bgmAgitMemberResponseDto = BgmAgitMemberResponseDto.create(member, authorities);
            // Access Token은 응답 JSON에 포함
            Map<String, Object> result = Map.of(
                    "user", bgmAgitMemberResponseDto,
                    "token", tokenPair.getAccessToken()
            );
            
            // Refresh Token은 HttpOnly 쿠키로 설정 (로그인 경로에 따라 쿠키 이름 분리)
            String cookieName = record
                    ? COOKIE_NAME_RECORD
                    : COOKIE_NAME_MAIN;

            ResponseCookie refreshCookie = ResponseCookie.from(cookieName, tokenPair.getRefreshToken())
                    .httpOnly(true)
                    .secure(secure) // 로컬일 경우 secure=false
                    .path("/")
                    .maxAge(Duration.ofDays(1))
                    .sameSite("Strict")
                    .build();
            response.addHeader("Set-Cookie", refreshCookie.toString());
            response.setContentType("application/json; charset=UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(result));
        } catch (JOSEException e) {
            throw new RuntimeException("JWT 생성 실패", e);
        }
    }
}
