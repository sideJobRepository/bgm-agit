package com.bgmagitapi.origin.murder.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Getter;

/**
 * 멤버별 게임수 (월간 랭킹용).
 */
@Getter
public class MemberMonthlyCountResponse {

    private final Long memberId;
    private final String nickname;
    private final Long playCount;

    @QueryProjection
    public MemberMonthlyCountResponse(Long memberId, String nickname, Long playCount) {
        this.memberId = memberId;
        this.nickname = nickname;
        this.playCount = playCount;
    }
}
