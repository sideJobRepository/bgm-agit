package com.bgmagitapi.kml.rating.dto;

import com.bgmagitapi.kml.rating.entity.Season;
import com.bgmagitapi.kml.rating.enums.SeasonProgressStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SeasonResponse {

    private Long id;                          // 시즌 ID
    private Long prevSeasonId;                // 이전 시즌 ID
    private String name;                      // 시즌 이름
    private LocalDate startDate;              // 시작 일시
    private LocalDate endDate;                // 종료 일시
    private SeasonProgressStatus progressStatus; // 진행 상태
    private String resetType;                 // 리셋 타입
    private BigDecimal carryRate;             // 계승 비율
    private BigDecimal baseRating;            // 기준 레이팅
    private BigDecimal firstScore;            // 1등 점수
    private BigDecimal secondScore;           // 2등 점수
    private BigDecimal thirdScore;            // 3등 점수
    private BigDecimal fourthScore;           // 4등 점수
    private BigDecimal eastMultiple;          // 동 배수
    private BigDecimal southMultiple;         // 남 배수
    private BigDecimal westMultiple;          // 서 배수
    private BigDecimal northMultiple;         // 북 배수

    public static SeasonResponse fromDomain(Season season) {
        return SeasonResponse.builder()
                .id(season.getId())
                .prevSeasonId(season.getPrevSeasonId())
                .name(season.getName())
                .startDate(season.getStartDate())
                .endDate(season.getEndDate())
                .progressStatus(season.getProgressStatus())
                .resetType(season.getResetType())
                .carryRate(season.getCarryRate())
                .baseRating(season.getBaseRating())
                .firstScore(season.getFirstScore())
                .secondScore(season.getSecondScore())
                .thirdScore(season.getThirdScore())
                .fourthScore(season.getFourthScore())
                .eastMultiple(season.getEastMultiple())
                .southMultiple(season.getSouthMultiple())
                .westMultiple(season.getWestMultiple())
                .northMultiple(season.getNorthMultiple())
                .build();
    }
}
