package com.bgmagitapi.origin.controller.response;

import com.bgmagitapi.origin.entity.BgmAgitRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BgmAgitRoleOptionResponse {

    private Long roleId;
    private String roleName;

    public static BgmAgitRoleOptionResponse from(BgmAgitRole role) {
        return BgmAgitRoleOptionResponse.builder()
                .roleId(role.getBgmAgitRoleId())
                .roleName(role.getBgmAgitRoleName())
                .build();
    }
}
