package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitNoticeCreateRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitNoticeModifyRequest;
import com.bgmagitapi.origin.controller.response.notice.BgmAgitNoticeResponse;
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
