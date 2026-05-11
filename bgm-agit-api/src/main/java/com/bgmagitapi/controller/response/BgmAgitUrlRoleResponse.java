package com.bgmagitapi.controller.response;

import com.bgmagitapi.entity.BgmAgitUrlResourcesRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BgmAgitUrlRoleResponse {

    private Long urlRoleId;
    private Long roleId;
    private String roleName;
    private Long resourceId;
    private String path;
    private String httpMethod;

    public static BgmAgitUrlRoleResponse from(BgmAgitUrlResourcesRole resourcesRole) {
        return BgmAgitUrlRoleResponse.builder()
                .urlRoleId(resourcesRole.getBgmAgitUrlResourcesRoleId())
                .roleId(resourcesRole.getBgmAgitRole().getBgmAgitRoleId())
                .roleName(resourcesRole.getBgmAgitRole().getBgmAgitRoleName())
                .resourceId(resourcesRole.getBgmAgitUrlResources().getBgmAgitUrlResourcesId())
                .path(resourcesRole.getBgmAgitUrlResources().getBgmAgitUrlResourcesPath())
                .httpMethod(resourcesRole.getBgmAgitUrlResources().getBgmAgitUrlHttpMethod())
                .build();
    }
}
