package com.bgmagitapi.origin.murder.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class PlayRecordListResponse {

    private Long id;
    private Long gameId;
    private String gameName;
    private String gameImageUrl;
    private LocalDate playDate;
    private Long writerId;
    private String writerNickname;
    private String memo;
    private int participantCount;
    private List<String> participantNicknames;
}
