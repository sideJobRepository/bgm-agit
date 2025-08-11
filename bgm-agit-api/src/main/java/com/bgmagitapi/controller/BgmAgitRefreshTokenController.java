package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.security.dto.TokenAndUser;
import com.bgmagitapi.service.BgmAgitRefreshTokenService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitRefreshTokenController {
    
    private final BgmAgitRefreshTokenService refreshTokenService;
    
    @Value("${cookie.secure}")
    private boolean secure;
    
    @PostMapping("/refresh")
    public Map<String, Object> refreshToken(@CookieValue(value = "refreshToken", required = false) String refreshToken
        , HttpServletResponse response
    ) {
        if(refreshToken == null) {
            return null;
        }
        TokenAndUser tokenPair = refreshTokenService.reissueTokenWithUser(refreshToken);
        ResponseCookie newRefreshCookie = ResponseCookie.from("refreshToken", tokenPair.token().getRefreshToken())
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(Duration.ofDays(1))
                .sameSite("Strict")
                .build();
        response.addHeader("Set-Cookie", newRefreshCookie.toString());
        return Map.of(
                "token", tokenPair.token().getAccessToken(),
                "user", tokenPair.user()
        );
    }
    
    @DeleteMapping("/refresh")
    public ApiResponse deleteRefreshToken(@CookieValue(value = "refreshToken", required = false) String refreshToken
            , HttpServletResponse response) {
        if (refreshToken == null) {
            return null;
        }
        ApiResponse apiResponse = refreshTokenService.deleteRefresh(refreshToken);
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(0) // 삭제
                .sameSite("Strict")
                .build();
        response.addHeader("Set-Cookie", deleteCookie.toString());
        return apiResponse;
    }
}