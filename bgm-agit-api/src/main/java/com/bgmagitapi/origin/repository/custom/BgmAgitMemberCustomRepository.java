package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.controller.response.BgmAgitMyPageGetResponse;

public interface BgmAgitMemberCustomRepository {
    
    BgmAgitMyPageGetResponse findByMyPage(Long id);
}
