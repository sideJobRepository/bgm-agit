package com.bgmagitapi.controller.request;

import com.bgmagitapi.entity.enumeration.BgmAgitNoticeType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BgmAgitNoticeCreateRequest {
    
    private String bgmAgitNoticeTitle;
    private String bgmAgitNoticeContent;
    private BgmAgitNoticeType  bgmAgitNoticeType;
}
