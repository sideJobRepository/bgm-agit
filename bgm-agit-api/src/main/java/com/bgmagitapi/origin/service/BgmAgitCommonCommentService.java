package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitCommonCommentPostRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitCommonCommentPutRequest;

public interface BgmAgitCommonCommentService {
    
    ApiResponse createComment(BgmAgitCommonCommentPostRequest request);
    
    ApiResponse modifyComment(BgmAgitCommonCommentPutRequest request);
    
    ApiResponse removeComment(Long id);
}
