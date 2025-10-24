package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitFreePostRequest;
import com.bgmagitapi.controller.response.BgmAgitFreeGetResponse;

import java.util.List;

public interface BgmAgitFreeService {

    List<BgmAgitFreeGetResponse> getBgmAgitFree();
    
    ApiResponse createBgmAgitFree(BgmAgitFreePostRequest request);
    
}
