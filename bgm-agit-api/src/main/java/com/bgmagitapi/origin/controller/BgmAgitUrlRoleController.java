package com.bgmagitapi.origin.controller;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitUrlRolePostRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitRoleOptionResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitUrlRoleResponse;
import com.bgmagitapi.origin.service.BgmAgitUrlRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitUrlRoleController {

    private final BgmAgitUrlRoleService urlRoleService;

    @GetMapping("/url-roles")
    public List<BgmAgitUrlRoleResponse> getUrlRoles() {
        return urlRoleService.getUrlRoles();
    }

    @GetMapping("/url-roles/roles")
    public List<BgmAgitRoleOptionResponse> getRoleOptions() {
        return urlRoleService.getRoleOptions();
    }

    @PostMapping("/url-roles")
    public ApiResponse createUrlRole(@Validated @RequestBody BgmAgitUrlRolePostRequest request) {
        return urlRoleService.createUrlRole(request);
    }
}
