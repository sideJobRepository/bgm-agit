package com.bgmagitapi.kml.rating.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 특정 회원의 시즌 등급 현황 (SeasonStanding 기반 + 순위/티어/최근변동 산출)
 * 목업 "내 등급" 카드(시즌등급순위표) · "시즌 등급" 카드(개인등급상세) 공용
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberStandingResponse {

    private Long seasonId;                 // 시즌 ID
    private String seasonName;             // 시즌 이름
    private Long memberId;                 // 회원 ID
    private String memberName;             // 회원 이름(닉네임)

    private BigDecimal rating;             // 현재 레이팅 (예: 1880)
    private Integer gameCount;             // 이번 시즌 판수 (예: 31)

    private Integer seasonRank;            // 시즌 순위 (배치중이면 null)
    private boolean provisional;           // 배치중 여부 (최소 판수 미만 → 순위 미부여)

    private String tierName;               // 현재 등급 이름 (예: "A")
    private Integer tierMinRating;         // 현재 등급 최소 레이팅

    private String nextTierName;           // 다음 등급 이름 (최상위면 null, 예: "S")
    private Integer nextTierMinRating;     // 다음 등급 최소 레이팅 (게이지 분모, 예: 2000)
    private BigDecimal pointsToNextTier;   // 다음 등급까지 남은 점수 (최상위면 null, 예: 120)

    private BigDecimal seasonHigh;         // 시즌 최고 레이팅 (예: 1920)
    private LocalDateTime seasonHighDateTime;      // 시즌 최고 레이팅 달성일 (예: 07-19)
    private BigDecimal seasonLow;          // 시즌 최저 레이팅 (예: 1640)
    private LocalDateTime seasonLowDateTime;       // 시즌 최저 레이팅 달성일 (예: 07-03)

    private List<BigDecimal> recentDeltas; // 최근 5판 레이팅 변동 (예: [+70, -50, +30, +70, -20])
}
