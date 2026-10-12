package com.bgmagitapi.origin.murder.controller;

import com.bgmagitapi.origin.advice.exception.ForbiddenException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.murder.dto.request.MurderCoverApplyRequest;
import com.bgmagitapi.origin.murder.dto.request.MurderGameCreateRequest;
import com.bgmagitapi.origin.murder.dto.request.MurderGameModifyRequest;
import com.bgmagitapi.origin.murder.dto.response.MurderCoverAutoFillResponse;
import com.bgmagitapi.origin.murder.dto.response.MurderGameResponse;
import com.bgmagitapi.origin.murder.service.BgmAgitMurderGameService;
import com.bgmagitapi.origin.murder.service.impl.MurderCoverAutoFillService;
import com.bgmagitapi.origin.murder.util.MurderLogCoverSearcher;
import com.bgmagitapi.origin.page.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    // 표지 후보: 머미로그에서 게임명으로 찾은 목록. 관리자가 정리 화면·등록 폼에서 하나를 고른다
    @GetMapping("/murder-games/cover-candidates")
    public List<MurderLogCoverSearcher.CoverCandidate> getCoverCandidates(@AuthenticationPrincipal Jwt jwt,
                                                                         @RequestParam("name") String name) {
        requireAdmin(jwt);
        return murderCoverAutoFillService.findCandidates(name);
    }

    // 붙여넣은 주소(이미지 또는 텀블벅·판매 페이지)가 가리키는 실제 이미지 주소. 저장 전 미리보기용
    @GetMapping("/murder-games/resolve-image")
    public Map<String, String> resolveCoverImage(@AuthenticationPrincipal Jwt jwt, @RequestParam("url") String url) {
        requireAdmin(jwt);
        return Map.of("imageUrl", murderCoverAutoFillService.resolveImageUrl(url));
    }

    // 표지 자동 채우기 한 건. 일괄은 프론트가 표지 없는 게임마다 부른다
    @PostMapping("/murder-games/{id}/auto-cover")
    public MurderCoverAutoFillResponse autoFillCover(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        requireAdmin(jwt);
        return murderCoverAutoFillService.autoFill(id);
    }

    // 표지 정리 화면에서 고른 표지 바로 넣기. 이름·인원 같은 나머지는 선택(없으면 표지만 바뀐다)
    @PutMapping("/murder-games/{id}/cover")
    public MurderCoverAutoFillResponse applyCover(@AuthenticationPrincipal Jwt jwt,
                                                  @PathVariable Long id,
                                                  @ModelAttribute MurderCoverApplyRequest request) {
        requireAdmin(jwt);
        return murderCoverAutoFillService.applyCover(id, request);
    }

    private void requireAdmin(Jwt jwt) {
        List<String> roles = jwt == null ? null : jwt.getClaim("roles");
        if (roles == null || !(roles.contains("ROLE_ADMIN") || roles.contains("ADMIN"))) {
            throw new ForbiddenException("관리자만 사용할 수 있습니다.");
        }
    }
}
