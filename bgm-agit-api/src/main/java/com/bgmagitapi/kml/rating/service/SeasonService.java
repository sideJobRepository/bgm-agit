package com.bgmagitapi.kml.rating.service;

import com.bgmagitapi.kml.rating.dto.SeasonCreateRequest;
import com.bgmagitapi.kml.rating.dto.SeasonOptionResponse;
import com.bgmagitapi.kml.rating.dto.SeasonResponse;
import com.bgmagitapi.kml.rating.dto.SeasonUpdateRequest;
import com.bgmagitapi.kml.rating.entity.Season;

import java.util.List;
import java.util.Optional;

public interface SeasonService {

    Season getSeason(Long seasonId);

    Optional<Season> getOngoingSeason();

    Season getLastClosedSeason();

    List<SeasonOptionResponse> getSeasonOptions();

    List<SeasonResponse> getSeasons();

    SeasonResponse createSeason(SeasonCreateRequest request);

    SeasonResponse updateSeason(Long seasonId, SeasonUpdateRequest request);

    SeasonResponse startSeason(Long seasonId);

    SeasonResponse closeSeason(Long seasonId);

    void deleteSeason(Long seasonId);
}
