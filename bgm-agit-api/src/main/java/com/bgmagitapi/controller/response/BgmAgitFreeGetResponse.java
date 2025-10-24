package com.bgmagitapi.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitFreeGetResponse {
    
    private Long freeId;
    private Long memberId;
    private String title;
}
