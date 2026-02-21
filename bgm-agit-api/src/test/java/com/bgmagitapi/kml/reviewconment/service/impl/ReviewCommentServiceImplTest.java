package com.bgmagitapi.kml.reviewconment.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.reviewconment.dto.request.ReviewCommentPostRequest;
import com.bgmagitapi.kml.reviewconment.dto.request.ReviewCommentPutRequest;
import com.bgmagitapi.kml.reviewconment.service.ReviewCommentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

class ReviewCommentServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private ReviewCommentService reviewCommentService;
    
    @DisplayName("")
    @Test
    void test1(){
        
        ReviewCommentPostRequest reviewCommentPostRequest = new ReviewCommentPostRequest(
                null,"댓글",3L,5L
        );
        ApiResponse comment = reviewCommentService.createComment(reviewCommentPostRequest);
        System.out.println(comment);
    }
    
    @DisplayName("")
    @Test
    void test2(){
        ReviewCommentPutRequest request = new ReviewCommentPutRequest(21L,"댓글댓글");
        ApiResponse apiResponse = reviewCommentService.modifyComment(request);
        System.out.println(apiResponse);
    }
    
    @DisplayName("")
    @Test
    void test3(){
        ApiResponse apiResponse = reviewCommentService.removeComment(21L);
        System.out.println(apiResponse);
    }
}