package com.bgmagitapi.origin.clocktower.controller;

import com.bgmagitapi.origin.advice.exception.ForbiddenException;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerGrimoireSaveRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerGrimoireSaveResponse;
import com.bgmagitapi.origin.clocktower.service.BgmAgitClockTowerGrimoireSaveService;
import com.bgmagitapi.origin.util.JwtParserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 마도서 임시저장. 전부 로그인 필수, 열기·덮어쓰기·삭제는 저장한 회원 또는 관리자만(서비스에서 확인).
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitClockTowerGrimoireSaveController {

    private final BgmAgitClockTowerGrimoireSaveService saveService;

    @PostMapping("/clocktower-grimoire-saves")
    public Map<String, Long> save(@Validated @RequestBody ClockTowerGrimoireSaveRequest request, @AuthenticationPrincipal Jwt jwt) {
        return Map.of("id", saveService.save(requireLogin(jwt), isAdmin(jwt), request));
    }

    @GetMapping("/clocktower-grimoire-saves")
    public List<ClockTowerGrimoireSaveResponse> mine(@AuthenticationPrincipal Jwt jwt) {
        return saveService.mine(requireLogin(jwt));
    }

    @GetMapping("/clocktower-grimoire-saves/{id}")
    public ClockTowerGrimoireSaveResponse get(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return saveService.get(id, requireLogin(jwt), isAdmin(jwt));
    }

    @DeleteMapping("/clocktower-grimoire-saves/{id}")
    public Map<String, Boolean> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        saveService.delete(id, requireLogin(jwt), isAdmin(jwt));
        return Map.of("deleted", true);
    }

    private Long requireLogin(Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        if (memberId == null) {
            throw new ForbiddenException("로그인이 필요합니다.");
        }
        return memberId;
    }

    private boolean isAdmin(Jwt jwt) {
        List<String> roles = JwtParserUtil.extractRoles(jwt);
        return roles.contains("ROLE_ADMIN") || roles.contains("ADMIN");
    }
}
