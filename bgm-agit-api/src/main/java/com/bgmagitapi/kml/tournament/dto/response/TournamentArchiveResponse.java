package com.bgmagitapi.kml.tournament.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
@AllArgsConstructor
public class TournamentArchiveResponse {

    private Long tournamentId;

    private String name;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String tournamentSettingName;

    private Integer participantCount;

    private String winnerNickName;
}
