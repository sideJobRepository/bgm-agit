package com.bgmagitapi.origin.my.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.my.dto.request.MyAcademyApprovalRequest;
import com.bgmagitapi.origin.my.dto.request.MyAcademyCancelRequest;
import com.bgmagitapi.origin.my.dto.response.MyAcademyGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MyAcademyService {
    
    
    Page<MyAcademyGetResponse> getMyAcademy(Pageable pageable,Long memberId,String role);
    ApiResponse approvalMyAcademy(MyAcademyApprovalRequest lectureId);
    ApiResponse cancelMyAcademy(MyAcademyCancelRequest request, String role);
    
}
