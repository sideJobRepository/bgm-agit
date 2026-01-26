package com.bgmagitapi.kml.record.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;

public interface RecordService {
    ApiResponse createRecord(RecordPostRequest request);
}
