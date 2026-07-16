package com.bgmagitapi.origin.murder.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Getter;

/**
 * 회원 월별 게임수 버킷 (예: "2026-06" → 5).
 */
@Getter
public class MemberMonthlyBucketResponse {

    private final String ym;
    private final Long playCount;

    @QueryProjection
    public MemberMonthlyBucketResponse(String ym, Long playCount) {
        this.ym = ym;
        this.playCount = playCount;
    }
}
