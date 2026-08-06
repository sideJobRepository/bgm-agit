package com.bgmagitapi.kml.rating.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberStandingRankResponse {

    private Integer seasonRank;        // 시즌 순위 (레이팅 내림차순, 1부터)
    private String tierName;           // 현재 등급 이름 (예: "A")
    private Long memberId;             // 회원 ID
    private String memberNickname;     // 회원 닉네임
    private BigDecimal rating;         // 현재 레이팅
    private long gameCount;            // 이번 시즌 판수
    private double firstRate;          // 1위 비율 (%)
    private double fourthRate;         // 4위 비율 (%)
    private double avgRank;            // 평균 순위
}
