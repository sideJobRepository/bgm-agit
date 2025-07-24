package com.bgmagitapi.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BgmAgitMainMenuImageResponse {
    
    private Long imageId;
    private Long labelGb;
    private String image;
    private String label;
    private String group;
    private String link;
    
}
