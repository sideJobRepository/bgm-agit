package com.bgmagitapi.kml.record.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.dto.request.RecordPutRequest;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.record.dto.response.RecordGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RecordService {
    Page<RecordGetResponse> getRecords(Pageable pageable);
    RecordGetDetailResponse getRecordDetail(Long id);
    ApiResponse createRecord(RecordPostRequest request);
    ApiResponse updateRecord(RecordPutRequest request);
}
