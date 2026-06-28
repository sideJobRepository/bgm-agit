package com.bgmagitapi.controller.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class BgmAgitMainMenuCreateOptionsResponse {

    private List<BgmAgitMainMenuOptionResponse> menus;
    private List<BgmAgitRoleOptionResponse> roles;
}
