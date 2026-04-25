package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.security.dto.TokenAndUser;
import com.bgmagitapi.security.handler.BgmAgitAuthenticationSuccessHandler;
import com.bgmagitapi.service.BgmAgitRefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
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
    public Map<String, Object> refreshToken(
            @RequestParam(value = "source", required = false, defaultValue = "main") String source,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String cookieName = resolveCookieName(source);
        String refreshToken = readCookie(request, cookieName);

        if (refreshToken == null) {
            return null;
        }

        TokenAndUser tokenPair = refreshTokenService.reissueTokenWithUser(refreshToken);
        if (tokenPair == null) {
            return null;
        }

        ResponseCookie.ResponseCookieBuilder cookieBuilder =
                ResponseCookie.from(cookieName, tokenPair.token().getRefreshToken())
                        .httpOnly(true)
                        .secure(secure)
                        .path("/")
                        .maxAge(Duration.ofDays(1));

        if (secure) {
            cookieBuilder.sameSite("Strict");
        } else {
            cookieBuilder.sameSite("Lax");
        }

        response.addHeader("Set-Cookie", cookieBuilder.build().toString());
        return Map.of(
                "token", tokenPair.token().getAccessToken(),
                "user", tokenPair.user()
        );
    }

    @DeleteMapping("/refresh")
    public ApiResponse deleteRefreshToken(
            @RequestParam(value = "source", required = false, defaultValue = "main") String source,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String cookieName = resolveCookieName(source);
        String refreshToken = readCookie(request, cookieName);

        ApiResponse apiResponse = refreshToken != null
                ? refreshTokenService.deleteRefresh(refreshToken)
                : null;

        ResponseCookie deleteCookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader("Set-Cookie", deleteCookie.toString());
        return apiResponse;
    }

    private String resolveCookieName(String source) {
        return "record".equalsIgnoreCase(source)
                ? BgmAgitAuthenticationSuccessHandler.COOKIE_NAME_RECORD
                : BgmAgitAuthenticationSuccessHandler.COOKIE_NAME_MAIN;
    }

    private String readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
