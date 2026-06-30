package com.bgmagitapi.controller;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitMahjongUseRequest;
import com.bgmagitapi.controller.request.BgmAgitMemberNicknameChangeRequest;
import com.bgmagitapi.controller.request.BgmAgitMemberPasswordChangeRequest;
import com.bgmagitapi.controller.request.BgmAgitRoleModifyRequest;
import com.bgmagitapi.controller.response.BgmAgitRoleResponse;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.service.BgmAgitRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitRoleController {

    private final BgmAgitRoleService bgmAgitRoleService;

    @GetMapping("/role")
    public PageResponse<BgmAgitRoleResponse> getRoles(
            @PageableDefault(size = 10) Pageable pageable
    , @RequestParam(required = false) String res
    ) {
        Page<BgmAgitRoleResponse> roles = bgmAgitRoleService.getRoles(pageable, res);
        return PageResponse.from(roles);
    }

    @GetMapping("/mahjong-role")
    public PageResponse<BgmAgitRoleResponse> getMahjongRoles(
            @PageableDefault(size = 10) Pageable pageable
            , @RequestParam(required = false) String res
    ) {
        Page<BgmAgitRoleResponse> roles = bgmAgitRoleService.getMahjongRoles(pageable, res);
        return PageResponse.from(roles);
    }

    @PutMapping("/role")
    public ApiResponse modifyRole(@AuthenticationPrincipal Jwt jwt,
                                  @Validated @RequestBody List<BgmAgitRoleModifyRequest> request) {
          return bgmAgitRoleService.modifyRole(request, extractRoles(jwt));
    }

    @PutMapping("/mahjong-role/password")
    public ApiResponse changePassword(@AuthenticationPrincipal Jwt jwt,
                                      @Validated @RequestBody BgmAgitMemberPasswordChangeRequest request) {
        return bgmAgitRoleService.changePassword(request, extractRoles(jwt));
    }

    @PutMapping("/mahjong-role/nickname")
    public ApiResponse changeNickname(@AuthenticationPrincipal Jwt jwt,
                                      @Validated @RequestBody BgmAgitMemberNicknameChangeRequest request) {
        return bgmAgitRoleService.changeNickname(request, extractRoles(jwt));
    }

    // 소셜 회원 삭제 (관리자 전용, 소셜 탭 정리용)
    @DeleteMapping("/role/{memberId}")
    public ApiResponse deleteSocialMember(@AuthenticationPrincipal Jwt jwt,
                                          @PathVariable Long memberId) {
        return bgmAgitRoleService.deleteSocialMember(memberId, extractRoles(jwt));
    }

    // 관리자가 자체로그인 회원의 마작(BML) 연동을 켜고 끔
    @PutMapping("/mahjong-role/mahjong-use")
    public ApiResponse setMahjongUse(@AuthenticationPrincipal Jwt jwt,
                                     @Validated @RequestBody BgmAgitMahjongUseRequest request) {
        return bgmAgitRoleService.setMahjongUse(request.getMemberId(), request.isUse(), extractRoles(jwt));
    }

    private List<String> extractRoles(Jwt jwt) {
        if (jwt == null) {
            return Collections.emptyList();
        }
        List<String> roles = jwt.getClaim("roles");
        return roles != null ? roles : Collections.emptyList();
    }
}
