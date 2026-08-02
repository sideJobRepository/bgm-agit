package com.bgmagitapi.kml.rating.repository;

import com.bgmagitapi.kml.rating.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RatingRepository extends JpaRepository<Rating, Long> {

}
