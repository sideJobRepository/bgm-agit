package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitFreePostRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitFreePutRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitFreeGetDetailResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitFreeGetResponse;
import com.bgmagitapi.origin.page.PageResponse;
import org.springframework.data.domain.Pageable;

public interface BgmAgitFreeService {
    
    PageResponse<BgmAgitFreeGetResponse> getBgmAgitFree(Pageable pageable,String titleOrCont);
    
    BgmAgitFreeGetDetailResponse getBgmAgitFreeDetail(Long id,Long memberId);
    
    ApiResponse createBgmAgitFree(BgmAgitFreePostRequest request);
    
    ApiResponse modifyBgmAgitFree(BgmAgitFreePutRequest request);
    
    ApiResponse romoveBgmAgitFree(Long id, Long memberId);
}
