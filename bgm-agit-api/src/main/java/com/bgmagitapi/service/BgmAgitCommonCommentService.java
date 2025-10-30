package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitCommonCommentPostRequest;
import com.bgmagitapi.controller.request.BgmAgitCommonCommentPutRequest;

public interface BgmAgitCommonCommentService {
    
    ApiResponse createComment(BgmAgitCommonCommentPostRequest request);
    
    ApiResponse modifyComment(BgmAgitCommonCommentPutRequest request);
    
    ApiResponse removeComment(Long id);
}
