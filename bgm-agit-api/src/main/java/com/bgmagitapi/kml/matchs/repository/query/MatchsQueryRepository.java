package com.bgmagitapi.kml.matchs.repository.query;

import com.bgmagitapi.kml.years.dto.response.YearRankGetResponse;

import java.util.List;

public interface MatchsQueryRepository {
    List<Integer> getMatchsYears();
    YearRankGetResponse getYearRanks(Integer year);
}
