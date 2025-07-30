package com.bgmagitapi.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitRoleModifyRequest;
import com.bgmagitapi.controller.request.BgmAgitRoleRequest;
import com.bgmagitapi.controller.response.BgmAgitRoleResponse;
import com.bgmagitapi.service.BgmAgitRoleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

class BgmAgitRoleServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private BgmAgitRoleService bgmAgitRoleService;
    
    
    @DisplayName("")
    @Test
    void test(){
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "bgmAgitReservationId"));
        Page<BgmAgitRoleResponse> roles = bgmAgitRoleService.getRoles(pageable, "kadia");
        System.out.println("roles = " + roles);
        
    }
    
    @DisplayName("")
    @Test
    void test2(){
        Long memberId = 3L; // '밤'의 MEMBER_ID
        Long adminRoleId = 1L; // ADMIN ROLE_ID
        BgmAgitRoleModifyRequest request = new BgmAgitRoleModifyRequest();
        request.setMemberId(memberId);
        request.setRoleId(adminRoleId);
        
        // when
        ApiResponse response = bgmAgitRoleService.modifyRole(request);
    
    }
}