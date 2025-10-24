package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitFreePostRequest;
import com.bgmagitapi.controller.response.BgmAgitFreeGetResponse;
import com.bgmagitapi.page.PageResponse;
import org.springframework.data.domain.Pageable;

public interface BgmAgitFreeService {
    
    PageResponse<BgmAgitFreeGetResponse> getBgmAgitFree(Pageable pageable);
    
    ApiResponse createBgmAgitFree(BgmAgitFreePostRequest request);
    
}
