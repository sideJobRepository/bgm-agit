package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.controller.response.BgmAgitMonthlyPassResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitMyPageGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BgmAgitMemberCustomRepository {

    BgmAgitMyPageGetResponse findByMyPage(Long id);

    // 권한관리 월간패스 탭. 전체 회원(소셜·자체로그인), onlyPass 면 패스 회원만
    Page<BgmAgitMonthlyPassResponse> findMonthlyPassMembers(Pageable pageable, String keyword, boolean onlyPass);

    // 매월 1일 초기화. 바뀐 행 수를 반환한다
    long resetMonthlyPass();
}
