package com.bgmagitapi.kml.review.repository.query;

import com.bgmagitapi.controller.response.BgmAgitFreeGetDetailResponse;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.kml.review.dto.response.ReviewGetDetailResponse;
import com.bgmagitapi.kml.review.dto.response.ReviewGetResponse;
import com.bgmagitapi.kml.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewQueryRepository {
    
    Page<ReviewGetResponse> findAllByReviews(Pageable pageable,String titleOrCont);
    ReviewGetDetailResponse findByReviewDetail(Long reviewId);
    
    Review findByIdAndMemberId(Long id, BgmAgitMember bgmAgitMember);
    
    List<ReviewGetDetailResponse.ReviewGetDetailResponseFile> findFiles(Long reviewId);
    
    List<ReviewGetDetailResponse.ReviewGetDetailResponseComment> findComments(Long reviewId, Long memberId);
    
    Long deleteByIdAndMember(Long id, BgmAgitMember bgmAgitMember);
}
