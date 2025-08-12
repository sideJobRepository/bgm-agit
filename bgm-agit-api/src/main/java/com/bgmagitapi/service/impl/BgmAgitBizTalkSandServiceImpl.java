package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.service.BgmAgitBizTalkSandService;
import com.bgmagitapi.service.BgmAgitBizTalkService;
import com.bgmagitapi.service.response.BizTalkTokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitBizTalkSandServiceImpl implements BgmAgitBizTalkSandService {
    
    private final BgmAgitBizTalkService bgmAgitBizTalkService;
    
    @Override
    public ApiResponse sandBizTalk() {
        
        BizTalkTokenResponse bizTalkToken = bgmAgitBizTalkService.getBizTalkToken();
        
        return null;
    }
}
