package com.bgmagitapi.origin.clocktower.controller;

import com.bgmagitapi.origin.advice.exception.ForbiddenException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerImageSyncRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerRoleModifyRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerScriptCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerGrimoireResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerImageStatusResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerImageSyncResult;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerImportResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerRoleResponse;
import com.bgmagitapi.origin.clocktower.service.BgmAgitClockTowerRoleService;
import com.bgmagitapi.origin.clocktower.service.ClockTowerImageSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 시계탑 캐릭터 사전·스크립트 등록. 전부 관리자 전용(원작 문구라 공개 화면에 내리지 않는다).
 * URL_RESOURCES 매핑(clocktower-dictionary-2026-11.sql)과 컨트롤러 검사를 둘 다 둔다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitClockTowerRoleController {

    private final BgmAgitClockTowerRoleService bgmAgitClockTowerRoleService;
    private final ClockTowerImageSyncService clockTowerImageSyncService;

    // 공식 데이터(캐릭터·밤 순서·징크스·한국어) 받아서 사전 갱신 + 기본 3종 스크립트 생성/갱신
    @PostMapping("/clocktower-roles/import")
    public ClockTowerImportResponse importOfficial(@AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        return bgmAgitClockTowerRoleService.importOfficial();
    }

    @GetMapping("/clocktower-roles")
    public List<ClockTowerRoleResponse> getRoles(@AuthenticationPrincipal Jwt jwt,
                                                 @RequestParam(name = "team", required = false) String team,
                                                 @RequestParam(name = "keyword", required = false) String keyword) {
        requireAdmin(jwt);
        return bgmAgitClockTowerRoleService.getRoles(team, keyword);
    }

    @PutMapping("/clocktower-roles/{id}")
    public ApiResponse modifyRole(@AuthenticationPrincipal Jwt jwt,
                                  @PathVariable Long id,
                                  @Validated @RequestBody ClockTowerRoleModifyRequest request) {
        requireAdmin(jwt);
        return bgmAgitClockTowerRoleService.modifyRole(id, request);
    }

    // 고친 표시만 풀어 다음 가져오기 때 공식 문구로 돌아가게 한다
    @PutMapping("/clocktower-roles/{id}/reset")
    public ApiResponse resetRole(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        requireAdmin(jwt);
        return bgmAgitClockTowerRoleService.resetRole(id);
    }

    // 캐릭터 이미지 S3 복사 현황(빠진 경로 목록). 관리 화면이 이걸 받아 30개씩 복사를 부른다
    @GetMapping("/clocktower-roles/images/status")
    public ClockTowerImageStatusResponse getImageStatus(@AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        return clockTowerImageSyncService.status();
    }

    @PostMapping("/clocktower-roles/images/sync")
    public List<ClockTowerImageSyncResult> syncImages(@AuthenticationPrincipal Jwt jwt,
                                                      @Validated @RequestBody ClockTowerImageSyncRequest request) {
        requireAdmin(jwt);
        return clockTowerImageSyncService.sync(request.getPaths(), request.isForce());
    }

    // 커스텀 스크립트 JSON 붙여넣기 등록
    @PostMapping("/clocktower-games/script")
    public ApiResponse createScript(@AuthenticationPrincipal Jwt jwt,
                                    @Validated @RequestBody ClockTowerScriptCreateRequest request) {
        requireAdmin(jwt);
        return bgmAgitClockTowerRoleService.createScript(request);
    }

    // 이야기꾼 진행판용 묶음. 이야기꾼은 그때그때 다르므로 로그인만 확인한다(원작 문구라 비로그인은 막는다)
    @GetMapping("/clocktower-games/{id}/grimoire")
    public ClockTowerGrimoireResponse getGrimoire(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        if (jwt == null) {
            throw new ForbiddenException("로그인이 필요합니다.");
        }
        return bgmAgitClockTowerRoleService.getGrimoire(id);
    }

    private void requireAdmin(Jwt jwt) {
        List<String> roles = jwt == null ? null : jwt.getClaim("roles");
        if (roles == null || !(roles.contains("ROLE_ADMIN") || roles.contains("ADMIN"))) {
            throw new ForbiddenException("관리자만 사용할 수 있습니다.");
        }
    }
}
