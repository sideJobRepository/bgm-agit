package com.bgmagitapi.origin.clocktower.controller;

import com.bgmagitapi.origin.advice.exception.ForbiddenException;
import com.bgmagitapi.origin.clocktower.util.VnamuScriptFetcher;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 커스텀 시계탑(botc.vnamu.com) 시트 주소 → 제목·스크립트 JSON 미리 받기(관리자).
 * 등록은 하지 않는다. 화면이 받은 값을 입력칸에 채우고, 관리자가 확인한 뒤 기존 [스크립트 등록]으로 저장한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitClockTowerScriptFetchController {

    private final VnamuScriptFetcher vnamuScriptFetcher;

    @GetMapping("/clocktower-games/script/fetch")
    public VnamuScriptFetcher.Fetched fetchScript(@AuthenticationPrincipal Jwt jwt,
                                                  @RequestParam(name = "url") String url) {
        requireAdmin(jwt);
        return vnamuScriptFetcher.fetch(url);
    }

    private void requireAdmin(Jwt jwt) {
        List<String> roles = jwt == null ? null : jwt.getClaim("roles");
        if (roles == null || !(roles.contains("ROLE_ADMIN") || roles.contains("ADMIN"))) {
            throw new ForbiddenException("관리자만 사용할 수 있습니다.");
        }
    }
}
