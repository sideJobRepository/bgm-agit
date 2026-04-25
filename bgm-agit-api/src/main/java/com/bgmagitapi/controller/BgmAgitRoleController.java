package com.bgmagitapi.controller;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitMemberPasswordChangeRequest;
import com.bgmagitapi.controller.request.BgmAgitRoleModifyRequest;
import com.bgmagitapi.controller.response.BgmAgitRoleResponse;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.service.BgmAgitRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
    public ApiResponse modifyRole(@Validated @RequestBody List<BgmAgitRoleModifyRequest> request) {
          return bgmAgitRoleService.modifyRole(request);
    }

    @PutMapping("/mahjong-role/password")
    public ApiResponse changePassword(@Validated @RequestBody BgmAgitMemberPasswordChangeRequest request) {
        return bgmAgitRoleService.changePassword(request);
    }
}
