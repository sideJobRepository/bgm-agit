package com.bgmagitapi.kml.rating.service;

import com.bgmagitapi.kml.rating.dto.MemberStandingRankResponse;
import com.bgmagitapi.kml.rating.dto.MemberStandingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SeasonStandingService {

    MemberStandingResponse getMemberCurrentStanding(Long memberId);

    MemberStandingResponse getMemberStanding(Long seasonId, Long memberId);

    Page<MemberStandingRankResponse> getStandings(Long seasonId, Pageable pageable);

}
