package com.bgmagitapi.kml.rank.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RankType {
    
    WEEKLY("주간"),
    MONTHLY("월간"),
    CUSTOM("사용자설정");
    
    private final String value;
}
