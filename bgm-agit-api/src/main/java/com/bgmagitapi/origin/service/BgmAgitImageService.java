package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitImageCreateRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitImageModifyRequest;

public interface BgmAgitImageService {
    
    ApiResponse createBgmAgitImage(BgmAgitImageCreateRequest request);
    
    ApiResponse modifyBgmAgitImage(BgmAgitImageModifyRequest request);
    
    ApiResponse deleteBgmAgitImage(Long imageId);
}
