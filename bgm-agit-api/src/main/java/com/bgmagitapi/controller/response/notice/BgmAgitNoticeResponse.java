package com.bgmagitapi.controller.response.notice;

import com.bgmagitapi.entity.BgmAgitNotice;
import com.bgmagitapi.entity.BgmAgitNoticeFile;
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
    private String bgmAgitNoticeType;
    
    private List<BgmAgitNoticeFileResponse> bgmAgitNoticeFileList;
    
}
