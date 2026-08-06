package com.bgmagitapi.kml.rating.repository.query;

import com.bgmagitapi.kml.rating.dto.SeasonStandingRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SeasonStandingQueryRepository {
    Page<SeasonStandingRow> findStandings(Long seasonId, Pageable pageable);
}
