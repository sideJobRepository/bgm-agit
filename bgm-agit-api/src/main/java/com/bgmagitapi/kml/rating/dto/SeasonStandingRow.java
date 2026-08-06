package com.bgmagitapi.kml.rating.dto;

import java.math.BigDecimal;


public record SeasonStandingRow(
        Long memberId,
        String memberNickname,
        BigDecimal rating,
        long gameCount,
        Double avgRank,
        long firstCount,
        long fourthCount
) {
}
