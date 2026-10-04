package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitServiceRequestPostRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitServiceRequestPutRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitServiceRequestGetDetailResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitServiceRequestGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BgmAgitServiceRequestService {

    Page<BgmAgitServiceRequestGetResponse> getServiceRequests(Pageable pageable, String titleOrCont);

    BgmAgitServiceRequestGetDetailResponse getDetailServiceRequest(Long id);

    ApiResponse createServiceRequest(BgmAgitServiceRequestPostRequest request);

    ApiResponse modifyServiceRequest(BgmAgitServiceRequestPutRequest request);

    ApiResponse deleteServiceRequest(Long id);
}
