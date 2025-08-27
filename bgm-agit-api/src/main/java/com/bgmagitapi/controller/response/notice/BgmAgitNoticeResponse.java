package com.bgmagitapi.controller.response.notice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitNoticeResponse {
    private Long bgmAgitNoticeId;
    private String bgmAgitNoticeTitle;
    private String bgmAgitNoticeCont;
    private String registDate;
    private String bgmAgitNoticeType;
    
    //private List<BgmAgitNoticeFileResponse> bgmAgitNoticeFileList;
    
}
