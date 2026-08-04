package com.bgmagitapi.kml.rating.entity;

import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.rating.dto.SeasonCreateRequest;
import com.bgmagitapi.kml.rating.enums.SeasonProgressStatus;
import com.bgmagitapi.kml.rating.exception.InvalidSeasonStatusException;
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
    @Enumerated(EnumType.STRING)
    @Column(name = "BGM_AGIT_SEASON_PROGRESS_STATUS")
    private SeasonProgressStatus progressStatus;

    // BGM 아지트 시즌 리셋 타입
    @Column(name = "BGM_AGIT_SEASON_RESET_TYPE")
    private String resetType;

    // BGM 아지트 시즌 계승 비율
    @Column(name = "BGM_AGIT_SEASON_CARRY_RATE")
    private BigDecimal carryRate;

    // BGM 아지트 시즌 기준 레이팅
    @Column(name = "BGM_AGIT_SEASON_BASE_RATING")
    private BigDecimal baseRating;

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
    @Column(name = "BGM_AGIT_SEASON_FOURTH_SCORE")
    private BigDecimal fourthScore;

    // BGM 아지트 시즌 동 배수
    @Column(name = "BGM_AGIT_SEASON_EAST_MULTIPLE")
    private BigDecimal eastMultiple;

    // BGM 아지트 시즌 남 배수
    @Column(name = "BGM_AGIT_SEASON_SOUTH_MULTIPLE")
    private BigDecimal southMultiple;

    // BGM 아지트 시즌 서 배수
    @Column(name = "BGM_AGIT_SEASON_WEST_MULTIPLE")
    private BigDecimal westMultiple;

    // BGM 아지트 시즌 북 배수
    @Column(name = "BGM_AGIT_SEASON_NORTH_MULTIPLE")
    private BigDecimal northMultiple;

    // BGM 아지트 시즌 사용 여부 (Y: 사용, N: 삭제)
    @Column(name = "BGM_AGIT_SEASON_USE_STATUS")
    private String useStatus;

    public static Season create(SeasonCreateRequest request) {
        return Season.builder()
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .progressStatus(SeasonProgressStatus.SCHEDULED)
                .resetType(request.getResetType())
                .carryRate(request.getCarryRate())
                .baseRating(request.getBaseRating())
                .firstScore(request.getFirstScore())
                .secondScore(request.getSecondScore())
                .thirdScore(request.getThirdScore())
                .fourthScore(request.getFourthScore())
                .eastMultiple(request.getEastMultiple())
                .southMultiple(request.getSouthMultiple())
                .westMultiple(request.getWestMultiple())
                .northMultiple(request.getNorthMultiple())
                .useStatus("Y")
                .build();
    }

    // 시즌 시작 (대기 -> 진행중)
    public void start() {
        if (progressStatus != SeasonProgressStatus.SCHEDULED) {
            throw new InvalidSeasonStatusException("대기 상태의 시즌만 시작할 수 있습니다. 현재 상태=" + progressStatus);
        }
        this.progressStatus = SeasonProgressStatus.ONGOING;
    }

    // 시즌 마감 (진행중 -> 종료)
    public void close() {
        if (progressStatus != SeasonProgressStatus.ONGOING) {
            throw new InvalidSeasonStatusException("진행중인 시즌만 마감할 수 있습니다. 현재 상태=" + progressStatus);
        }
        this.progressStatus = SeasonProgressStatus.CLOSED;
    }

    public void delete() {
        this.useStatus = "N";
    }

    public void update(String name, LocalDate startDate, LocalDate endDate,
                       String resetType, BigDecimal carryRate,
                       BigDecimal baseRating, BigDecimal firstScore, BigDecimal secondScore,
                       BigDecimal thirdScore, BigDecimal fourthScore, BigDecimal eastMultiple,
                       BigDecimal southMultiple, BigDecimal westMultiple, BigDecimal northMultiple) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.resetType = resetType;
        this.carryRate = carryRate;
        this.baseRating = baseRating;
        this.firstScore = firstScore;
        this.secondScore = secondScore;
        this.thirdScore = thirdScore;
        this.fourthScore = fourthScore;
        this.eastMultiple = eastMultiple;
        this.southMultiple = southMultiple;
        this.westMultiple = westMultiple;
        this.northMultiple = northMultiple;
    }

    public BigDecimal calculateScore(int rank, MatchsWind wind) {
        return getScoreByRank(rank).multiply(getMultipleBy(wind));
    }

    private BigDecimal getScoreByRank(int rank) {
        return switch (rank) {
            case 1 -> firstScore;
            case 2 -> secondScore;
            case 3 -> thirdScore;
            case 4 -> fourthScore;
            default -> throw new IllegalArgumentException("지원하지 않는 등수입니다. rank=" + rank);
        };
    }

    private BigDecimal getMultipleBy(MatchsWind matchsWind) {
        return switch (matchsWind) {
            case EAST -> eastMultiple;
            case SOUTH -> southMultiple;
            case WEST -> westMultiple;
            case NORTH -> northMultiple;
        };
    }


}
