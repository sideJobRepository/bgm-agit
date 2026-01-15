package com.bgmagitapi.kml.notice.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePostRequest;

public interface KmlNoticeService {
    
    ApiResponse createKmlNotice(KmlNoticePostRequest request);
}
