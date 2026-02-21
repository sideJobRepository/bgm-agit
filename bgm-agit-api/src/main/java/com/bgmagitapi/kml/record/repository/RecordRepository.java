package com.bgmagitapi.kml.record.repository;

import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.record.repository.query.RecordQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecordRepository extends JpaRepository<Record, Long>, RecordQueryRepository {
}
