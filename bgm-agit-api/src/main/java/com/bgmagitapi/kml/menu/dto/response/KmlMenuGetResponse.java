package com.bgmagitapi.kml.menu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
