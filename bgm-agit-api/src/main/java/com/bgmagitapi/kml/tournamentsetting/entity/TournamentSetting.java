package com.bgmagitapi.kml.tournamentsetting.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Table(name = "BGM_AGIT_TOURNAMENT_SETTING")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class TournamentSetting extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_TOURNAMENT_SETTING_ID")
    private Long id;

    @Column(name = "BGM_AGIT_TOURNAMENT_SETTING_TURNING")
    private Integer turning;

    @Column(name = "BGM_AGIT_TOURNAMENT_SETTING_FIRST_UMA")
    private BigDecimal firstUma;

    @Column(name = "BGM_AGIT_TOURNAMENT_SETTING_SECOND_UMA")
    private BigDecimal secondUma;

    @Column(name = "BGM_AGIT_TOURNAMENT_SETTING_THIRD_UMA")
    private BigDecimal thirdUma;

    @Column(name = "BGM_AGIT_TOURNAMENT_SETTING_FOUR_UMA")
    private BigDecimal fourUma;

    @Column(name = "BGM_AGIT_TOURNAMENT_SETTING_USE_STATUS")
    private String useStatus;
}
