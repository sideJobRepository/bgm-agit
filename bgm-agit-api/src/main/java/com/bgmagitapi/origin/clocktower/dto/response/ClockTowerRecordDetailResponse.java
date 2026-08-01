package com.bgmagitapi.origin.clocktower.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class ClockTowerRecordDetailResponse {

    private Long id;
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
