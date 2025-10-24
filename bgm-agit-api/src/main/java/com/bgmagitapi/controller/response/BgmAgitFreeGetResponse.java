package com.bgmagitapi.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitFreeGetResponse {
    
    private Long id;
    private String title;
    private String content;
    private Long memberId;
    private Long commentCount;
}
