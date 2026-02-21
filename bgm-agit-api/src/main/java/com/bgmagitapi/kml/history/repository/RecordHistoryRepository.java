package com.bgmagitapi.kml.history.repository;

import com.bgmagitapi.kml.history.entity.RecordHistory;
import com.bgmagitapi.kml.history.repository.query.RecordHistoryQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecordHistoryRepository extends JpaRepository<RecordHistory, Long>, RecordHistoryQueryRepository {
}
