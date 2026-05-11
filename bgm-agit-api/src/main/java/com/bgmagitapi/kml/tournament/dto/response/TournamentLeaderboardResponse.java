package com.bgmagitapi.kml.tournament.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class TournamentLeaderboardResponse {

    private Long tournamentId;

    private String tournamentName;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String progressStatus;

    private List<Entry> entries;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Entry {
        private Long memberId;
        private String nickName;
        private Long gameCount;
        private Double totalPoint;
        private Double avgRank;
        private Long firstCount;
        private Long fourthCount;
    }
}
