package com.bgmagitapi.kml.rating.dto;

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
public class SeasonCreateRequest {

    private String name;                          // 시즌 이름
    private LocalDate startDate;                  // 시작 일시
    private LocalDate endDate;                    // 종료 일시
    private String resetType;                     // 리셋 타입
    private BigDecimal carryRate;                 // 계승 비율
    private BigDecimal baseRating;                // 기준 레이팅
    private BigDecimal firstScore;                // 1등 점수
    private BigDecimal secondScore;               // 2등 점수
    private BigDecimal thirdScore;                // 3등 점수
    private BigDecimal fourthScore;               // 4등 점수
    private BigDecimal eastMultiple;              // 동 배수
    private BigDecimal southMultiple;             // 남 배수
    private BigDecimal westMultiple;              // 서 배수
    private BigDecimal northMultiple;             // 북 배수
}
