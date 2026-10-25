package com.bgmagitapi.origin.clocktower.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerRoleModifyRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerScriptCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerGrimoireResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerImportResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerRoleResponse;

import java.util.List;

public interface BgmAgitClockTowerRoleService {

    ClockTowerImportResponse importOfficial();

    List<ClockTowerRoleResponse> getRoles(String team, String keyword);

    ApiResponse modifyRole(Long id, ClockTowerRoleModifyRequest request);

    ApiResponse resetRole(Long id);

    ApiResponse createScript(ClockTowerScriptCreateRequest request);

    ClockTowerGrimoireResponse getGrimoire(Long gameId);
}
