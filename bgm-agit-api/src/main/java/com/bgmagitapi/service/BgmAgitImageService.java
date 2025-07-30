package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitImageCreateRequest;

public interface BgmAgitImageService {
    
    ApiResponse createBgmAgitImage(BgmAgitImageCreateRequest request);
}
