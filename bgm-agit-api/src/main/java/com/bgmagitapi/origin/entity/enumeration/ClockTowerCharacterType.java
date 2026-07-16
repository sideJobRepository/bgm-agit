package com.bgmagitapi.origin.entity.enumeration;

import lombok.Getter;

/**
 * 시계탑(Blood on the Clocktower) 역할군.
 * 선(시민) 팀 = 마을주민·외부인 / 악 팀 = 하수인·악마.
 */
@Getter
public enum ClockTowerCharacterType {

    TOWNSFOLK("마을주민"),
    OUTSIDER("외부인"),
    MINION("하수인"),
    DEMON("악마");

    private final String value;

    ClockTowerCharacterType(String value) {
        this.value = value;
    }

    /** 악(惡) 팀 여부 (하수인/악마) */
    public boolean isEvil() {
        return this == MINION || this == DEMON;
    }
}
