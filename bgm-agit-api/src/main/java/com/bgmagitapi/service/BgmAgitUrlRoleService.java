package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitUrlRolePostRequest;
import com.bgmagitapi.controller.response.BgmAgitRoleOptionResponse;
import com.bgmagitapi.controller.response.BgmAgitUrlRoleResponse;

import java.util.List;

public interface BgmAgitUrlRoleService {

    List<BgmAgitUrlRoleResponse> getUrlRoles();

    List<BgmAgitRoleOptionResponse> getRoleOptions();

    ApiResponse createUrlRole(BgmAgitUrlRolePostRequest request);
}
