package com.bgmagitapi.origin.clocktower.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class ClockTowerRecordDetailResponse {

    private Long id;
    // 끝난 게임의 마도서가 함께 저장돼 있으면 true(내용은 /clocktower-records/{id}/grimoire 로 따로 받는다 — 크다)
    private boolean hasGrimoire;
    private Long gameId;
    private String gameName;
    private String gameImageUrl;
    private Integer gameMinPlayers;
    private Integer gameMaxPlayers;
    private LocalDate playDate;
    private String result;        // GOOD_WIN / EVIL_WIN
    private String resultName;    // 선인승 / 악마승
    private Boolean draft;        // true=임시저장
    private Long writerId;
    private String writerNickname;
    private String memo;
    private List<ClockTowerParticipantResponse> participants;
    private boolean canManage;
}
