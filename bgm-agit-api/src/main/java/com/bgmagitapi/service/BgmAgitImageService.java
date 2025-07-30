package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitImageCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitImageModifyRequest;

public interface BgmAgitImageService {
    
    ApiResponse createBgmAgitImage(BgmAgitImageCreateRequest request);
    
    ApiResponse modifyBgmAgitImage(BgmAgitImageModifyRequest request);
    
    ApiResponse deleteBgmAgitImage(Long imageId);
}
