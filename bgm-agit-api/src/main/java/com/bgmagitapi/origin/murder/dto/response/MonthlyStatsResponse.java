package com.bgmagitapi.origin.murder.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 이번달(또는 지정 월) 게임 랭킹 응답.
 * - totalCount: 해당 월 전체 세션 수
 * - members: 멤버별 게임수 (내림차순)
 */
@Getter
@Builder
public class MonthlyStatsResponse {

    private int year;
    private int month;
    private long totalCount;
    private List<MemberMonthlyCountResponse> members;
}
