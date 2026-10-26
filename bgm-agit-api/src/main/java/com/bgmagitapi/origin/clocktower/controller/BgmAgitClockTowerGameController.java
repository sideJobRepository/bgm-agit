package com.bgmagitapi.origin.clocktower.controller;

import com.bgmagitapi.origin.advice.exception.ForbiddenException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerGameCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerGameModifyRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerGameResponse;
import com.bgmagitapi.origin.clocktower.service.BgmAgitClockTowerGameService;
import com.bgmagitapi.origin.page.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitClockTowerGameController {

    private final BgmAgitClockTowerGameService bgmAgitClockTowerGameService;

    @GetMapping("/clocktower-games")
    public PageResponse<ClockTowerGameResponse> getGames(
            @PageableDefault(size = 12) Pageable pageable,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "source", required = false) String source) {
        return PageResponse.from(bgmAgitClockTowerGameService.getGames(pageable, keyword, source));
    }

    @GetMapping("/clocktower-games/simple")
    public List<ClockTowerGameResponse> getSimpleGames() {
        return bgmAgitClockTowerGameService.getSimpleGames();
    }

    @GetMapping("/clocktower-games/{id}")
    public ClockTowerGameResponse getGame(@PathVariable Long id) {
        return bgmAgitClockTowerGameService.getGame(id);
    }

    @PostMapping("/clocktower-games")
    public ApiResponse createGame(@AuthenticationPrincipal Jwt jwt,
                                  @Validated @ModelAttribute ClockTowerGameCreateRequest request) {
        requireAdmin(jwt);
        return bgmAgitClockTowerGameService.createGame(request);
    }

    @PutMapping("/clocktower-games/{id}")
    public ApiResponse modifyGame(@AuthenticationPrincipal Jwt jwt,
                                  @PathVariable Long id,
                                  @Validated @ModelAttribute ClockTowerGameModifyRequest request) {
        requireAdmin(jwt);
        return bgmAgitClockTowerGameService.modifyGame(id, request);
    }

    @DeleteMapping("/clocktower-games/{id}")
    public ApiResponse deleteGame(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        requireAdmin(jwt);
        return bgmAgitClockTowerGameService.deleteGame(id);
    }

    private void requireAdmin(Jwt jwt) {
        List<String> roles = jwt == null ? null : jwt.getClaim("roles");
        if (roles == null || !(roles.contains("ROLE_ADMIN") || roles.contains("ADMIN"))) {
            throw new ForbiddenException("관리자만 사용할 수 있습니다.");
        }
    }
}
