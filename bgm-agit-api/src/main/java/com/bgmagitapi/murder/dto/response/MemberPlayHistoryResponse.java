package com.bgmagitapi.murder.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Getter;

import java.time.LocalDate;

/**
 * 회원이 플레이한 게임 이력 (게임별 횟수 + 최근 플레이 날짜). 리마인딩용.
 */
@Getter
public class MemberPlayHistoryResponse {

    private final Long gameId;
    private final String gameName;
    private final String gameImageUrl;
    private final Long playCount;
    private final LocalDate lastPlayDate;

    @QueryProjection
    public MemberPlayHistoryResponse(Long gameId, String gameName, String gameImageUrl,
                                     Long playCount, LocalDate lastPlayDate) {
        this.gameId = gameId;
        this.gameName = gameName;
        this.gameImageUrl = gameImageUrl;
        this.playCount = playCount;
        this.lastPlayDate = lastPlayDate;
    }
}
