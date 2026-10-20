package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.controller.response.BgmAgitMonthlyPassResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitMyPageGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.YearMonth;

public interface BgmAgitMemberCustomRepository {

    BgmAgitMyPageGetResponse findByMyPage(Long id);

    // 권한관리 월간패스 탭. 전체 회원(소셜·자체로그인), onlyPass 면 이번 달 이후 패스 기간이 있는 회원만
    Page<BgmAgitMonthlyPassResponse> findMonthlyPassMembers(Pageable pageable, String keyword, boolean onlyPass, YearMonth thisMonth);
}
