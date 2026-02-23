package com.bgmagitapi.kml.record.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.dto.request.RecordPutRequest;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.record.dto.response.RecordGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RecordService {
    Page<RecordGetResponse> getRecords(Pageable pageable, String startDate, String endDate, String nickName);
    RecordGetDetailResponse getRecordDetail(Long id);
    ApiResponse createRecord(RecordPostRequest request, Long memberId);
    ApiResponse updateRecord(RecordPutRequest request,Long memberId);
    
    ApiResponse removeRecord(Long id, Long memberId);
}
