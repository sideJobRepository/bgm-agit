package com.bgmagitapi.kml.history.repository;

import com.bgmagitapi.kml.history.entity.MatchsHistory;
import com.bgmagitapi.kml.history.repository.query.MatchsHistoryQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchsHistoryRepository extends JpaRepository<MatchsHistory, Long>, MatchsHistoryQueryRepository {
    

}
