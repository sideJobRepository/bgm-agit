package com.bgmagitapi.kml.rating.repository;

import com.bgmagitapi.kml.rating.entity.Rating;
import com.bgmagitapi.kml.rating.entity.Season;
import com.bgmagitapi.kml.rating.enums.SeasonProgressStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

}
