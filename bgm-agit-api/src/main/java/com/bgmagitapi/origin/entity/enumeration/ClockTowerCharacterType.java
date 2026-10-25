package com.bgmagitapi.origin.entity.enumeration;

import lombok.Getter;

/**
 * 시계탑(Blood on the Clocktower) 역할군.
 * 선(시민) 팀 = 마을주민·외부인 / 악 팀 = 하수인·악마.
 * 여행자는 이야기꾼이 선악을 정하고, 전설·로릭은 이야기꾼이 쓰는 규칙 캐릭터라 좌석에 앉지 않는다.
 */
@Getter
public enum ClockTowerCharacterType {

    TOWNSFOLK("마을주민"),
    OUTSIDER("외부인"),
    MINION("하수인"),
    DEMON("악마"),
    TRAVELLER("여행자"),
    FABLED("전설"),
    LORIC("로릭");

    private final String value;

    ClockTowerCharacterType(String value) {
        this.value = value;
    }

    /** 악(惡) 팀 여부 (하수인/악마) */
    public boolean isEvil() {
        return this == MINION || this == DEMON;
    }

    /** 플레이어가 맡는 캐릭터인지 (전설·로릭은 이야기꾼 규칙이라 아님) */
    public boolean isSeatable() {
        return this != FABLED && this != LORIC;
    }

    /** 공식 데이터의 team 값(townsfolk 등) → 역할군. 모르는 값이면 null */
    public static ClockTowerCharacterType fromTeam(String team) {
        if (team == null) return null;
        try {
            return valueOf(team.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
