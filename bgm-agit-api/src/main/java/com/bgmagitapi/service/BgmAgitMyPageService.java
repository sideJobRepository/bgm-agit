package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.response.BgmAgitMyPageGetResponse;
import com.bgmagitapi.controller.response.notice.BgmAgitMyPagePutRequest;

public interface BgmAgitMyPageService {

    BgmAgitMyPageGetResponse getMyPage(Long id);
    
    ApiResponse modifyMyPage(BgmAgitMyPagePutRequest request);
}
