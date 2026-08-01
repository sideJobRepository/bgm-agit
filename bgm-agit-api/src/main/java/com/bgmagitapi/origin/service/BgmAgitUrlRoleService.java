package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitUrlRolePostRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitRoleOptionResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitUrlRoleResponse;

import java.util.List;

public interface BgmAgitUrlRoleService {

    List<BgmAgitUrlRoleResponse> getUrlRoles();

    List<BgmAgitRoleOptionResponse> getRoleOptions();

    ApiResponse createUrlRole(BgmAgitUrlRolePostRequest request);
}
