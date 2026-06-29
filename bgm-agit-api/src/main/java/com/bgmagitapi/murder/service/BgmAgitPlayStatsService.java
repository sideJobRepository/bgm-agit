package com.bgmagitapi.murder.service;

import com.bgmagitapi.murder.dto.response.MemberMonthlyBucketResponse;
import com.bgmagitapi.murder.dto.response.MonthlyStatsResponse;

import java.util.List;

public interface BgmAgitPlayStatsService {

    // 이번달(또는 지정 월) 게임 랭킹
    MonthlyStatsResponse getMonthly(Integer year, Integer month);

    // 특정 회원의 월별 게임수
    List<MemberMonthlyBucketResponse> getMemberMonthly(Long memberId);
}
