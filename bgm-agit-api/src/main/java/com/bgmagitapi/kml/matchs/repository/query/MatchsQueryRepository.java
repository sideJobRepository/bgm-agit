package com.bgmagitapi.kml.matchs.repository.query;

import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.years.dto.response.YearRankGetResponse;

import java.util.List;

public interface MatchsQueryRepository {
    List<Integer> getMatchsYears();
    YearRankGetResponse getYearRanks(Integer year);

    // KML 미연동(matchsKmlId IS NULL) + 미삭제 대국을 오래된 순으로 조회 (재전송 스케줄러용)
    List<Matchs> findByMatchsKmlIdIsNull(int limit);
}
