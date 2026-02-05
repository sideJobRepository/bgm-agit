package com.bgmagitapi.kml.menu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class KmlMenuGetResponse {
    
    private Long id;
    
    private String menuName;
    
    private String menuLink;
    
    private Integer menuOrders;
    
    private String icon;
    
    private Long parentMenuId;
    
    private List<KmlMenuGetResponse> subMenus;
    
    public List<KmlMenuGetResponse> getSubMenus() {
        if(this.subMenus == null) {
            this.subMenus = new ArrayList<>();
        }
        return this.subMenus;
    }
}
