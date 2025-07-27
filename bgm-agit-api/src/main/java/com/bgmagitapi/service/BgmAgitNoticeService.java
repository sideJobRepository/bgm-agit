package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitNoticeCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitNoticeModifyRequest;
import com.bgmagitapi.controller.response.BgmAgitNoticeResponse;

import java.util.List;

public interface BgmAgitNoticeService {
    
    
    List<BgmAgitNoticeResponse> getNotice();
    
    ApiResponse createNotice(BgmAgitNoticeCreateRequest request);
    
    ApiResponse modifyNotice(BgmAgitNoticeModifyRequest request);
    
    ApiResponse deleteNotice(Integer noticeId);
}
