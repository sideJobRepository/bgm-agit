package com.bgmagitapi.origin.murder.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 회원 플레이 이력 페이지 응답.
 * - thisMonthCount: 이번달 내(해당 회원) 게임수 배지
 * - games: 게임별 플레이 이력
 * - monthly: 월별 게임수 버킷
 */
@Getter
@Builder
public class MemberHistoryResponse {

    private long thisMonthCount;
    private long totalCount;
    private List<MemberPlayHistoryResponse> games;
    private List<MemberMonthlyBucketResponse> monthly;
}
