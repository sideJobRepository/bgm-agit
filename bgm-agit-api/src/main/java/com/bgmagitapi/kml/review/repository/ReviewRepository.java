package com.bgmagitapi.kml.review.repository;

import com.bgmagitapi.kml.review.entity.Review;
import com.bgmagitapi.kml.review.repository.query.ReviewQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long>, ReviewQueryRepository {
}
