package com.bgmagitapi.kml.rating.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Table(name = "BGM_AGIT_SEASON")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class Season {

    // BGM 아지트 시즌 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_SEASON_ID")
    private Long id;

    // BGM 아지트 시즌 이전 시즌 ID
    @Column(name = "BGM_AGIT_SEASON_PREV_SEASON_ID")
    private Long prevSeasonId;

    // BGM 아지트 시즌 이름
    @Column(name = "BGM_AGIT_SEASON_NAME")
    private String name;

    // BGM 아지트 시즌 시작 일시
    @Column(name = "BGM_AGIT_SEASON_START_DATE")
    private LocalDate startDate;

    // BGM 아지트 시즌 종료 일시
    @Column(name = "BGM_AGIT_SEASON_END_DATE")
    private LocalDate endDate;

    // BGM 아지트 시즌 진행 상태
    @Column(name = "BGM_AGIT_SEASON_PROGRESS_STATUS")
    private String progressStatus;

    // BGM 아지트 시즌 리셋 타입
    @Column(name = "BGM_AGIT_SEASON_RESET_TYPE")
    private String resetType;

    // BGM 아지트 시즌 계승 비율
    @Column(name = "BGM_AGIT_SEASON_CARRY_RATE")
    private BigDecimal carryRate;

    // BGM 아지트 시즌 기준 레이팅
    @Column(name = "BGM_AGIT_SEASON_BASE_RATING")
    private Integer baseRating;

    // BGM 아지트 시즌 1등 점수
    @Column(name = "BGM_AGIT_SEASON_FIRST_SCORE")
    private BigDecimal firstScore;

    // BGM 아지트 시즌 2등 점수
    @Column(name = "BGM_AGIT_SEASON_SECOND_SCORE")
    private BigDecimal secondScore;

    // BGM 아지트 시즌 3등 점수
    @Column(name = "BGM_AGIT_SEASON_THIRD_SCORE")
    private BigDecimal thirdScore;

    // BGM 아지트 시즌 4등 점수
    @Column(name = "BGM_AGIT_SEASON_FOUR_SCORE")
    private BigDecimal fourScore;

    // BGM 아지트 시즌 동 배수
    @Column(name = "BGM_AGIT_SEASON_EAST_MULTIPLE")
    private BigDecimal eastMultiple;

    // BGM 아지트 시즌 남 배수
    @Column(name = "BGM_AGIT_SEASON_SOUTH_MULTIPLE")
    private BigDecimal southMultiple;

    // BGM 아지트 시즌 서 배수
    @Column(name = "BGM_AGIT_SEASON_WEST_MULTIPLE")
    private BigDecimal westMultiple;
}
