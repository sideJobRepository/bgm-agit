package com.bgmagitapi.kml.notice.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePostRequest;
import com.bgmagitapi.kml.notice.dto.response.KmlNoticeGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface KmlNoticeService {
    
    
    Page<KmlNoticeGetResponse> getKmlNotice(Pageable pageable);
    ApiResponse createKmlNotice(KmlNoticePostRequest request);
}
