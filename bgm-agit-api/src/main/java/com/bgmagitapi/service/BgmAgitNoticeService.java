package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitNoticeCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitNoticeModifyRequest;
import com.bgmagitapi.controller.response.notice.BgmAgitNoticeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitNoticeService {
    
    
    Page<BgmAgitNoticeResponse> getNotice(Pageable pageable, String title);
    
    List<BgmAgitNoticeResponse> getPopupNotice();
    
    ApiResponse createNotice(BgmAgitNoticeCreateRequest request);
    
    ApiResponse modifyNotice(BgmAgitNoticeModifyRequest request);
    
    ApiResponse deleteNotice(Long noticeId);
}
