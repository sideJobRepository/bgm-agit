package com.bgmagitapi.kml.my.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.my.dto.response.MyAcademyGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MyAcademyService {
    
    
    Page<MyAcademyGetResponse> getMyAcademy(Pageable pageable,Long memberId,String role);
    ApiResponse approvalMyAcademy(Long lectureId);
    ApiResponse cancelMyAcademy(Long lectureId);
    
}
