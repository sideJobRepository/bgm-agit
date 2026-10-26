package com.bgmagitapi.origin.clocktower.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/** 마도서 임시저장. 목록에서는 state 를 비워 보낸다(크다) */
@Getter
@Builder
public class ClockTowerGrimoireSaveResponse {

    private Long id;
    private Long gameId;
    private String gameName;
    private String title;
    private LocalDateTime savedAt;
    private String state;
}
