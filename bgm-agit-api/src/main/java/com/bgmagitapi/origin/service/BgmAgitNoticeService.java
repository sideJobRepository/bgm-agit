package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitNoticeCreateRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitNoticeModifyRequest;
import com.bgmagitapi.origin.controller.response.notice.BgmAgitNoticeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitNoticeService {
    
    
    Page<BgmAgitNoticeResponse> getNotice(Pageable pageable, String title);

    /** 공지 단건 조회. 상세 화면이 목록 1페이지에서 찾던 방식(2페이지 이후 글은 못 찾음)을 대체 */
    BgmAgitNoticeResponse getNoticeDetail(Long noticeId);
    
    List<BgmAgitNoticeResponse> getPopupNotice();
    
    ApiResponse createNotice(BgmAgitNoticeCreateRequest request);
    
    ApiResponse modifyNotice(BgmAgitNoticeModifyRequest request);
    
    ApiResponse deleteNotice(Long noticeId);
}
