package com.bgmagitapi.kml.rating.service;

import com.bgmagitapi.kml.rating.dto.MemberStandingResponse;
import com.bgmagitapi.kml.rating.dto.SeasonCreateRequest;
import com.bgmagitapi.kml.rating.dto.SeasonOptionResponse;
import com.bgmagitapi.kml.rating.dto.SeasonResponse;
import com.bgmagitapi.kml.rating.dto.SeasonUpdateRequest;

import java.util.List;

public interface SeasonService {

    List<SeasonOptionResponse> getSeasonOptions();

    MemberStandingResponse getMemberStanding(Long seasonId, Long memberId);

    List<SeasonResponse> getSeasons();

    SeasonResponse createSeason(SeasonCreateRequest request);

    SeasonResponse updateSeason(Long seasonId, SeasonUpdateRequest request);

    SeasonResponse startSeason(Long seasonId);

    SeasonResponse closeSeason(Long seasonId);

    void deleteSeason(Long seasonId);
}
