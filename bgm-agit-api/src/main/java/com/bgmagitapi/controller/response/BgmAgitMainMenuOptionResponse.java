package com.bgmagitapi.controller.response;

import com.bgmagitapi.entity.BgmAgitMainMenu;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class BgmAgitMainMenuOptionResponse {

    private Long menuId;
    private Long parentMenuId;
    private String menuName;
    private String menuLink;
    private Long areaId;
    private Boolean useStatus;
    private List<Long> roleIds;

    public static BgmAgitMainMenuOptionResponse from(BgmAgitMainMenu menu, List<Long> roleIds) {
        return BgmAgitMainMenuOptionResponse.builder()
                .menuId(menu.getBgmAgitMainMenuId())
                .parentMenuId(menu.getParentMenuId())
                .menuName(menu.getBgmAgitMenuName())
                .menuLink(menu.getBgmAgitMenuLink())
                .areaId(menu.getBgmAgitAreaId())
                .useStatus(menu.getBgmAgitUseStatus())
                .roleIds(roleIds)
                .build();
    }
}
