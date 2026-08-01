package com.bgmagitapi.kml.rating.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SeasonProgressStatus {

    SCHEDULED("대기"),
    ONGOING("진행중"),
    CLOSED("종료");

    private final String description;
}
