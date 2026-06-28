package com.bgmagitapi.entity.enumeration;

import lombok.Getter;

@Getter
public enum GatheringType {

    MURDER_MYSTERY("머더미스터리"),
    CLOCK_TOWER("시계탑");

    private final String value;

    GatheringType(String value) {
        this.value = value;
    }
}
