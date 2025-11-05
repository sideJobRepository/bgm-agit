package com.bgmagitapi.repository.custom;

import com.bgmagitapi.controller.response.BgmAgitMyPageGetResponse;

public interface BgmAgitMemberCustomRepository {
    
    BgmAgitMyPageGetResponse findByMyPage(Long id);
}
