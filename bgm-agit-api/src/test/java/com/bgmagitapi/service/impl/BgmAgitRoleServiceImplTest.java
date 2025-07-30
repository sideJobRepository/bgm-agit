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

import java.util.ArrayList;
import java.util.List;

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
        // given
        Long userRoleId = 1L; // USER 권한 ID
        List<BgmAgitRoleModifyRequest> requestList = new ArrayList<>();
        
        BgmAgitRoleModifyRequest request1 = new BgmAgitRoleModifyRequest();
        request1.setMemberId(1L); // 지수
        request1.setRoleId(userRoleId);
        
        BgmAgitRoleModifyRequest request2 = new BgmAgitRoleModifyRequest();
        request2.setMemberId(3L); // 밤
        request2.setRoleId(userRoleId);
        
        requestList.add(request1);
        requestList.add(request2);
        
        // when
        ApiResponse response = bgmAgitRoleService.modifyRole(requestList);
    
    }
}