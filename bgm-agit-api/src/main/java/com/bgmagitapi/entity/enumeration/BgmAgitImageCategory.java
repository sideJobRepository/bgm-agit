package com.bgmagitapi.entity.enumeration;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum BgmAgitImageCategory {
    
    MURDER("머더 미스터리"),
    STRATEGY("전략"),
    PARTY("파티(가족)"),
    DRINK("음료수"),
    FOOD("음식"),
    ROOM("방"),
    MAIN("메인 이미지"),
    MAHJONG("마작");
    private final String categoryValue;
}
