package com.bgmagitapi.kml.tournament.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import com.bgmagitapi.kml.tournament.enums.TournamentProgressStatus;
import com.bgmagitapi.kml.tournamentsetting.entity.TournamentSetting;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Table(name = "BGM_AGIT_TOURNAMENT")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class Tournament extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_TOURNAMENT_ID")
    private Long id;

    @JoinColumn(name = "BGM_AGIT_TOURNAMENT_SETTING_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private TournamentSetting tournamentSetting;

    @Column(name = "BGM_AGIT_TOURNAMENT_NAME")
    private String name;

    @Column(name = "BGM_AGIT_TOURNAMENT_START_DATE")
    private LocalDate startDate;

    @Column(name = "BGM_AGIT_TOURNAMENT_END_DATE")
    private LocalDate endDate;

    @Column(name = "BGM_AGIT_TOURNAMENT_START_TIME")
    private LocalTime startTime;

    @Column(name = "BGM_AGIT_TOURNAMENT_END_TIME")
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "BGM_AGIT_TOURNAMENT_PROGRESS_STATUS")
    private TournamentProgressStatus progressStatus;

    public void update(TournamentSetting tournamentSetting, String name,
                       LocalDate startDate, LocalDate endDate,
                       LocalTime startTime, LocalTime endTime) {
        this.tournamentSetting = tournamentSetting;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public void start() {
        this.progressStatus = TournamentProgressStatus.ACTIVE;
    }

    public void close() {
        this.progressStatus = TournamentProgressStatus.CLOSED;
    }
}
