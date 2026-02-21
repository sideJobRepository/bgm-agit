package com.bgmagitapi.kml.review.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.review.dto.request.ReviewPostRequest;
import com.bgmagitapi.kml.review.dto.request.ReviewPutRequest;
import com.bgmagitapi.kml.review.dto.response.ReviewGetDetailResponse;
import com.bgmagitapi.kml.review.dto.response.ReviewGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewService {
    
    Page<ReviewGetResponse> getReviews(Pageable pageable,String titleOrCont);
    ReviewGetDetailResponse getReviewDetail(Long reviewId);
    ApiResponse createReview(ReviewPostRequest request);
    ApiResponse modifyReview(ReviewPutRequest request);
    ApiResponse deleteReview(Long id);
}
