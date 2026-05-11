package com.bgmagitapi.kml.menu.dto.response;

import com.bgmagitapi.kml.menu.entity.KmlMenu;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class KmlMenuOptionResponse {

    private Long menuId;

    private Long parentMenuId;

    private String menuName;

    private String menuLink;

    private Integer menuOrders;

    private String icon;

    private List<Long> roleIds;

    public static KmlMenuOptionResponse from(KmlMenu menu, List<Long> roleIds) {
        return KmlMenuOptionResponse.builder()
                .menuId(menu.getId())
                .parentMenuId(menu.getParentMenuId() != null ? menu.getParentMenuId().getId() : null)
                .menuName(menu.getMenuName())
                .menuLink(menu.getMenuLink())
                .menuOrders(menu.getOrders())
                .icon(menu.getIcon())
                .roleIds(roleIds)
                .build();
    }
}
