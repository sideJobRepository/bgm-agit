package com.bgmagitapi.origin.murder.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class PlayRecordDetailResponse {

    private Long id;
    private Long gameId;
    private String gameName;
    private String gameImageUrl;
    private Integer gameMinPlayers;
    private Integer gameMaxPlayers;
    private LocalDate playDate;
    private Long writerId;
    private String writerNickname;
    private String memo;
    private List<PlayRecordParticipantResponse> participants;
    // 작성자 본인 또는 관리자면 true (프론트 수정/삭제 버튼 노출용)
    private boolean canManage;
}
