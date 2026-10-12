package com.bgmagitapi.origin.murder.controller;

import com.bgmagitapi.origin.advice.exception.ForbiddenException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.murder.dto.request.MurderGameCreateRequest;
import com.bgmagitapi.origin.murder.dto.request.MurderGameModifyRequest;
import com.bgmagitapi.origin.murder.dto.response.MurderCoverAutoFillResponse;
import com.bgmagitapi.origin.murder.dto.response.MurderGameResponse;
import com.bgmagitapi.origin.murder.service.BgmAgitMurderGameService;
import com.bgmagitapi.origin.murder.service.impl.MurderCoverAutoFillService;
import com.bgmagitapi.origin.murder.util.BoardlifeCoverSearcher;
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
public class BgmAgitMurderGameController {

    private final BgmAgitMurderGameService bgmAgitMurderGameService;
    private final MurderCoverAutoFillService murderCoverAutoFillService;

    @GetMapping("/murder-games")
    public PageResponse<MurderGameResponse> getMurderGames(
            @PageableDefault(size = 12) Pageable pageable,
            @RequestParam(name = "keyword", required = false) String keyword) {
        return PageResponse.from(bgmAgitMurderGameService.getMurderGames(pageable, keyword));
    }

    // 플레이 기록 등록 화면 드롭다운용 경량 목록
    @GetMapping("/murder-games/simple")
    public List<MurderGameResponse> getSimpleGames() {
        return bgmAgitMurderGameService.getSimpleGames();
    }

    @GetMapping("/murder-games/{id}")
    public MurderGameResponse getMurderGame(@PathVariable Long id) {
        return bgmAgitMurderGameService.getMurderGame(id);
    }

    // 등록·수정·삭제는 관리자 전용. 예전엔 프론트 버튼만 숨기고 있었다.
    // URL_RESOURCES 에 매핑이 없으면 기본 통과라 여기서 직접 막는다
    @PostMapping("/murder-games")
    public ApiResponse createMurderGame(@AuthenticationPrincipal Jwt jwt,
                                        @Validated @ModelAttribute MurderGameCreateRequest request) {
        requireAdmin(jwt);
        return bgmAgitMurderGameService.createMurderGame(request);
    }

    @PutMapping("/murder-games/{id}")
    public ApiResponse modifyMurderGame(@AuthenticationPrincipal Jwt jwt,
                                        @PathVariable Long id,
                                        @Validated @ModelAttribute MurderGameModifyRequest request) {
        requireAdmin(jwt);
        return bgmAgitMurderGameService.modifyMurderGame(id, request);
    }

    @DeleteMapping("/murder-games/{id}")
    public ApiResponse deleteMurderGame(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        requireAdmin(jwt);
        return bgmAgitMurderGameService.deleteMurderGame(id);
    }

    // 표지 후보: 보드라이프에서 게임명으로 찾은 목록. 관리자가 등록 폼에서 하나를 고른다
    @GetMapping("/murder-games/cover-candidates")
    public List<BoardlifeCoverSearcher.CoverCandidate> getCoverCandidates(@AuthenticationPrincipal Jwt jwt,
                                                                         @RequestParam("name") String name) {
        requireAdmin(jwt);
        return murderCoverAutoFillService.findCandidates(name);
    }

    // 표지 자동 채우기 한 건. 일괄은 프론트가 표지 없는 게임마다 부른다
    @PostMapping("/murder-games/{id}/auto-cover")
    public MurderCoverAutoFillResponse autoFillCover(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        requireAdmin(jwt);
        return murderCoverAutoFillService.autoFill(id);
    }

    private void requireAdmin(Jwt jwt) {
        List<String> roles = jwt == null ? null : jwt.getClaim("roles");
        if (roles == null || !(roles.contains("ROLE_ADMIN") || roles.contains("ADMIN"))) {
            throw new ForbiddenException("관리자만 사용할 수 있습니다.");
        }
    }
}
