package com.bgmagitapi.kml.review.repository.query;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.kml.review.dto.response.ReviewGetResponse;
import com.bgmagitapi.kml.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewQueryRepository {
    
    Page<ReviewGetResponse> findAllByReviews(Pageable pageable,String titleOrCont);
    Review findByIdAndMemberId(Long id, BgmAgitMember bgmAgitMember);
}
