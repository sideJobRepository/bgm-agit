package com.bgmagitapi.kml.menu.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
public class KmlMenuPostRequest {

    private Long parentMenuId;

    @NotEmpty
    private String menuName;

    private String menuLink;

    @NotNull
    private Integer menuOrders;

    private String icon;

    @NotEmpty
    private List<Long> roleIds;
}
