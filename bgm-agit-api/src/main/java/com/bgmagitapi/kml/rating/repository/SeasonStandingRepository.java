package com.bgmagitapi.kml.rating.repository;

import com.bgmagitapi.kml.rating.entity.SeasonStanding;
import com.bgmagitapi.kml.rating.repository.query.SeasonStandingQueryRepository;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SeasonStandingRepository extends JpaRepository<SeasonStanding, Long> , SeasonStandingQueryRepository {

    List<SeasonStanding> findBySeasonIdAndMemberBgmAgitMemberIdIn(@Param("seasonId") Long seasonId,
                                                     @Param("memberIds") Collection<Long> memberIds);

    @Query("select ss from SeasonStanding ss where ss.member.bgmAgitMemberId = :memberId")
    Optional<SeasonStanding> findByMemberId(@Param("memberId") Long memberId);

}
