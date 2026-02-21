package com.bgmagitapi.kml.reviewconment.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.reviewconment.dto.request.ReviewCommentPostRequest;
import com.bgmagitapi.kml.reviewconment.dto.request.ReviewCommentPutRequest;

public interface ReviewCommentService {
    
    ApiResponse createComment(ReviewCommentPostRequest request);
    
    ApiResponse modifyComment(ReviewCommentPutRequest request);
    
    ApiResponse removeComment(Long id);
}
