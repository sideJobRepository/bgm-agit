package com.bgmagitapi.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitNoticeResponse {
    private Long bgmAgitNoticeId;
    private String bgmAgitNoticeTitle;
    private String bgmAgitNoticeCont;
    private String bgmAgitNoticeType;
}
