package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.service.response.BizTalkTokenResponse;

public interface BgmAgitBiztalkTokenCustomRepository {
    
    long deleteIp(String bgmAgitBiztalkIp);
    
    BizTalkTokenResponse getBizTalkToken(String publicIp);
}
