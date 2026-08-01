package com.bgmagitapi.origin.controller.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;

import java.util.List;

@Getter
public class BgmAgitMainMenuPostRequest {

    private Long parentMenuId;

    @NotEmpty
    private String menuName;

    private String menuLink;

    // 영역/정렬 구분 (BGM_AGIT_AREA_ID)
    private Long areaId;

    private Boolean useStatus;

    @NotEmpty
    private List<Long> roleIds;
}
