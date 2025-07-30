package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitRoleModifyRequest;
import com.bgmagitapi.controller.response.BgmAgitRoleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitRoleService {
    
    Page<BgmAgitRoleResponse> getRoles(Pageable pageable, String request);
    
    ApiResponse modifyRole(List<BgmAgitRoleModifyRequest> request );
}
