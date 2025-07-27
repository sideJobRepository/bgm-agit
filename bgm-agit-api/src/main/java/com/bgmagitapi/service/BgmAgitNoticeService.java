package com.bgmagitapi.service;

import com.bgmagitapi.controller.response.BgmAgitNoticeResponse;

import java.util.List;

public interface BgmAgitNoticeService {
    
    
    List<BgmAgitNoticeResponse> getNotice();
}
