package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitInquiryPostRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitInquiryPutRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitInquiryGetDetailResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitInquiryGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BgmAgitInquiryService {

    
    Page<BgmAgitInquiryGetResponse> getInquiry(Long memberId, String role, Pageable pageable, String titleOrCont);
    
    BgmAgitInquiryGetDetailResponse getDetailInquiry(Long inquiryId);
    
    ApiResponse createInquiry(BgmAgitInquiryPostRequest request);
    
    ApiResponse modifyInquiry(BgmAgitInquiryPutRequest request);
    
    ApiResponse deleteInquiry(Long id);
    
}
