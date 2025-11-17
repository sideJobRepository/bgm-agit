package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitInquiryPostRequest;
import com.bgmagitapi.controller.request.BgmAgitInquiryPutRequest;
import com.bgmagitapi.controller.response.BgmAgitInquiryGetDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitInquiryGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BgmAgitInquiryService {

    
    Page<BgmAgitInquiryGetResponse> getInquiry(Long memberId, String role, Pageable pageable, String titleOrCont);
    
    BgmAgitInquiryGetDetailResponse getDetailInquiry(Long inquiryId);
    
    ApiResponse createInquiry(BgmAgitInquiryPostRequest request);
    
    ApiResponse modifyInquiry(BgmAgitInquiryPutRequest request);
    
    ApiResponse deleteInquiry(Long id);
    
}
