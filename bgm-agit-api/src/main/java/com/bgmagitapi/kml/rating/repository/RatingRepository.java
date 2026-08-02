package com.bgmagitapi.kml.rating.repository;

import com.bgmagitapi.kml.rating.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    @Query("select r from Rating r where r.member.bgmAgitMemberId = :memberId")
    List<Rating> findByMemberId(@Param("memberId") Long memberId);

}
