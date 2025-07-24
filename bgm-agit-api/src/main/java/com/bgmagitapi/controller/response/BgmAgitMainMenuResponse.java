package com.bgmagitapi.controller.response;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class BgmAgitMainMenuResponse {
    private Long bgmAgitMainMenuId;                      // BGM_AGIT_MAIN_MENU_ID
    private String name;                      // BGM_AGIT_MENU_NAME
    private Long bgmAgitSubMenuId;                       // BGM_AGIT_SUB_MENU_ID (상위 메뉴 ID, null이면 루트)
    private Long bgmAgitAreaId;                         // BGM_AGIT_AREA_ID (위치 구분: 중앙/하단 등)
    private String link;
    private List<BgmAgitMainMenuResponse> subMenus;
    
    public List<BgmAgitMainMenuResponse> getSubMenus() {
        if(subMenus == null) {
            this.subMenus = new ArrayList<>();
        }
        return this.subMenus;
    }
}
