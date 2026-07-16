package com.bgmagitapi.kml.menu.dto.response;

import com.bgmagitapi.origin.controller.response.BgmAgitRoleOptionResponse;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class KmlMenuCreateOptionsResponse {

    private List<KmlMenuOptionResponse> menus;

    private List<BgmAgitRoleOptionResponse> roles;
}
