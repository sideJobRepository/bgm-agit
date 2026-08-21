package com.bgmagitapi.kml.rating.repository.query;

import com.bgmagitapi.kml.rating.dto.SeasonStandingRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SeasonStandingQueryRepository {
    Page<SeasonStandingRow> findStandings(Long seasonId, Pageable pageable);

    /**
     * 특정 시즌에서 해당 회원의 순위(1-based)를 계산한다.
     * 정렬 기준은 findStandings와 동일하게 레이팅 내림차순, 동률 시 회원 ID 오름차순.
     */
    int findRank(Long seasonId, Long memberId);
}
