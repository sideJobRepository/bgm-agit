package com.bgmagitapi.repository.costom;

import com.bgmagitapi.service.response.BizTalkTokenResponse;

public interface BgmAgitBiztalkTokenCustomRepository {
    
    long deleteIp(String bgmAgitBiztalkIp);
    
    BizTalkTokenResponse getBizTalkToken(String publicIp);
}
