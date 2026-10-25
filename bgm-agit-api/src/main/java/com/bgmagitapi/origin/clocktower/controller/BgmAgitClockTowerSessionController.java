package com.bgmagitapi.origin.clocktower.controller;

import com.bgmagitapi.origin.advice.exception.ForbiddenException;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerSessionCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerSessionSeatsRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerSessionViewedRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerMySeatResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerSessionStatusResponse;
import com.bgmagitapi.origin.clocktower.service.BgmAgitClockTowerSessionService;
import com.bgmagitapi.origin.util.JwtParserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 이야기꾼 진행판 ↔ 플레이어 휴대폰 "내 캐릭터".
 * 전부 로그인 필수. 이야기꾼 동작(만들기·좌석 갱신·상태·닫기)은 세션을 만든 회원 또는 관리자만(서비스에서 확인).
 * 플레이어 조회(mine)는 내 줄만 내려준다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitClockTowerSessionController {

    private final BgmAgitClockTowerSessionService sessionService;

    @PostMapping("/clocktower-sessions")
    public Map<String, Object> createSession(@AuthenticationPrincipal Jwt jwt,
                                             @RequestBody ClockTowerSessionCreateRequest request) {
        Long memberId = requireLogin(jwt);
        return Map.of("sessionId", sessionService.createSession(memberId, request));
    }

    @PutMapping("/clocktower-sessions/{id}/seats")
    public Map<String, Object> updateSeats(@AuthenticationPrincipal Jwt jwt,
                                           @PathVariable Long id,
                                           @RequestBody ClockTowerSessionSeatsRequest request) {
        Long memberId = requireLogin(jwt);
        return Map.of("updated", sessionService.updateSeats(id, memberId, isAdmin(jwt), request));
    }

    @GetMapping("/clocktower-sessions/{id}/status")
    public ClockTowerSessionStatusResponse getStatus(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        Long memberId = requireLogin(jwt);
        return sessionService.getStatus(id, memberId, isAdmin(jwt));
    }

    @PostMapping("/clocktower-sessions/{id}/close")
    public Map<String, Object> closeSession(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        Long memberId = requireLogin(jwt);
        sessionService.closeSession(id, memberId, isAdmin(jwt));
        return Map.of("ok", true);
    }

    /** 앉은 세션이 없으면 HTTP 200 + {active:false} */
    @GetMapping("/clocktower-sessions/mine")
    public Object getMySeat(@AuthenticationPrincipal Jwt jwt) {
        Long memberId = requireLogin(jwt);
        ClockTowerMySeatResponse response = sessionService.getMySeat(memberId);
        if (!response.isActive()) {
            return Map.of("active", false);
        }
        return response;
    }

    @PostMapping("/clocktower-sessions/mine/viewed")
    public Map<String, Object> markViewed(@AuthenticationPrincipal Jwt jwt,
                                          @RequestBody ClockTowerSessionViewedRequest request) {
        Long memberId = requireLogin(jwt);
        sessionService.markViewed(memberId, request);
        return Map.of("ok", true);
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
