package com.bgmagitapi.origin.murder.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Getter;

import java.time.LocalDate;

/**
 * 특정 게임을 이미 플레이한 경험이 있는 회원 (기록 작성 폼 안내용).
 */
@Getter
public class ExperiencedMemberResponse {

    private final Long memberId;
    private final String nickname;
    private final Long playCount;
    private final LocalDate lastPlayDate;

    @QueryProjection
    public ExperiencedMemberResponse(Long memberId, String nickname, Long playCount, LocalDate lastPlayDate) {
        this.memberId = memberId;
        this.nickname = nickname;
        this.playCount = playCount;
        this.lastPlayDate = lastPlayDate;
    }
}
