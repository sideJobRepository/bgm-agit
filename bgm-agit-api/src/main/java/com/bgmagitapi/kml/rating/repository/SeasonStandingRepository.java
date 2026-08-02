package com.bgmagitapi.kml.rating.repository;

import com.bgmagitapi.kml.rating.entity.SeasonStanding;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface SeasonStandingRepository extends JpaRepository<SeasonStanding, Long> {

    List<SeasonStanding> findBySeasonIdAndMemberBgmAgitMemberIdIn(@Param("seasonId") Long seasonId,
                                                     @Param("memberIds") Collection<Long> memberIds);

}
