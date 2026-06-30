package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitMyPasswordChangeRequest;
import com.bgmagitapi.controller.response.BgmAgitMyPageGetResponse;
import com.bgmagitapi.controller.response.notice.BgmAgitMyPagePutRequest;

public interface BgmAgitMyPageService {

    BgmAgitMyPageGetResponse getMyPage(Long id);

    ApiResponse modifyMyPage(BgmAgitMyPagePutRequest request);

    ApiResponse changeMyPassword(Long memberId, BgmAgitMyPasswordChangeRequest request);

    // 보드게임 회원 → 마작(BML) 기록 이용 회원으로 전환 신청 (이 시점에 KML 등록 수행)
    ApiResponse applyMahjongUse(Long memberId);

    // 마작(BML) 기록 이용 신청 취소 (실수로 신청한 경우 해지)
    ApiResponse cancelMahjongUse(Long memberId);
}
