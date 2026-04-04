package com.bgmagitapi.kml.rank.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RankType {
    
    WEEKLY("주간"),
    MONTHLY("월간");
    
    private final String value;
}
