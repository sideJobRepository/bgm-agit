package com.bgmagitapi.kml.record.repository.query;

import com.bgmagitapi.kml.record.entity.Record;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RecordQueryRepository {
    
    Page<Record> findByRecords(Pageable pageable);
    
}
