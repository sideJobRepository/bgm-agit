package com.bgmagitapi.origin.clocktower.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class ClockTowerRecordListResponse {

    private Long id;
    private Long gameId;
    private String gameName;
    private String gameImageUrl;
    private LocalDate playDate;
    private String result;        // GOOD_WIN / EVIL_WIN
    private String resultName;    // 선인승 / 악마승
    private Boolean draft;        // true=임시저장
    private Long writerId;
    private String writerNickname;
    private String memo;
    private int participantCount;
    private List<String> participantNicknames;
    // 참가자별 캐릭터·진영·최종 선악(이야기꾼은 characterName="이야기꾼", type=null). 목록 카드에서 진영별로 묶어 보여준다
    private List<ClockTowerParticipantResponse> participants;
}
