package com.bgmagitapi.origin.clocktower.util;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

/**
 * 시계탑 관리 권한 판정 한 곳. 멘토 이상(관리자·멘토)이 시계탑을 관리한다(2026-11-02 사용자 결정 — 예전엔 관리자만).
 * 게임·사전·스크립트 등록, 남의 기록·임시저장·세션 관리, 임시저장 기록 보기가 전부 이 판정을 쓴다.
 * JWT roles 는 계층이 펼쳐지지 않은 실제 역할이라 관리자·멘토를 둘 다 본다.
 */
public final class ClockTowerPermission {

    private ClockTowerPermission() {
    }

    public static boolean isManager(List<String> roles) {
        if (roles == null) {
            return false;
        }
        return roles.contains("ROLE_ADMIN") || roles.contains("ADMIN")
                || roles.contains("ROLE_MENTOR") || roles.contains("MENTOR");
    }

    public static boolean isManager(Jwt jwt) {
        return jwt != null && isManager(jwt.<List<String>>getClaim("roles"));
    }
}
