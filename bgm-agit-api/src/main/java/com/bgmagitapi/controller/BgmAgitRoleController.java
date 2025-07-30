package com.bgmagitapi.controller;


import com.bgmagitapi.controller.request.BgmAgitRoleRequest;
import com.bgmagitapi.controller.response.BgmAgitRoleResponse;
import com.bgmagitapi.service.BgmAgitRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitRoleController {

    private final BgmAgitRoleService bgmAgitRoleService;
    
    @GetMapping("/role")
    public Page<BgmAgitRoleResponse> getRoles(
            @PageableDefault(size = 10) Pageable pageable
    , @RequestBody BgmAgitRoleRequest request
    ) {
        bgmAgitRoleService.getRoles(pageable,request);
        return null;
    }
}
