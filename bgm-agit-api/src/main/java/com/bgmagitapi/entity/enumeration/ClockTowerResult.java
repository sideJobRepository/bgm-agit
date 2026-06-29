package com.bgmagitapi.entity.enumeration;

import lombok.Getter;

/** 시계탑 세션 결과 (어느 팀이 이겼는지) */
@Getter
public enum ClockTowerResult {

    GOOD_WIN("선인승"),
    EVIL_WIN("악마승");

    private final String value;

    ClockTowerResult(String value) {
        this.value = value;
    }
}
