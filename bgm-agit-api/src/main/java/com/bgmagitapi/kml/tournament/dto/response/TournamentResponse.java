package com.bgmagitapi.kml.tournament.dto.response;

import com.bgmagitapi.kml.tournament.entity.Tournament;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class TournamentResponse {

    private Long tournamentId;

    private Long tournamentSettingId;

    private String tournamentSettingName;

    private Integer tournamentSettingTurning;

    private String name;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String progressStatus;

    public static TournamentResponse from(Tournament tournament) {
        return TournamentResponse.builder()
                .tournamentId(tournament.getId())
                .tournamentSettingId(tournament.getTournamentSetting() != null ? tournament.getTournamentSetting().getId() : null)
                .tournamentSettingName(tournament.getTournamentSetting() != null
                        ? TournamentSettingOptionResponse.from(tournament.getTournamentSetting()).getLabel()
                        : null)
                .tournamentSettingTurning(tournament.getTournamentSetting() != null
                        ? tournament.getTournamentSetting().getTurning()
                        : null)
                .name(tournament.getName())
                .startDate(tournament.getStartDate())
                .endDate(tournament.getEndDate())
                .startTime(tournament.getStartTime())
                .endTime(tournament.getEndTime())
                .progressStatus(tournament.getProgressStatus().name())
                .build();
    }
}
