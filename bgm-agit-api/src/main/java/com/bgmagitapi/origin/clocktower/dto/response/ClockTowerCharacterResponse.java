package com.bgmagitapi.origin.clocktower.dto.response;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerCharacter;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ClockTowerCharacterResponse {

    private Long id;
    private String name;
    private String type;       // TOWNSFOLK / OUTSIDER / MINION / DEMON
    private String typeName;   // 마을주민 / 외부인 / 하수인 / 악마
    private String description;
    private Integer orders;
    private String roleKey;    // 캐릭터 사전 키. 직접 입력한 캐릭터는 null

    public static ClockTowerCharacterResponse of(BgmAgitClockTowerCharacter c) {
        return ClockTowerCharacterResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .type(c.getCharacterType() != null ? c.getCharacterType().name() : null)
                .typeName(c.getCharacterType() != null ? c.getCharacterType().getValue() : null)
                .description(c.getDescription())
                .orders(c.getOrders())
                .roleKey(c.getRoleKey())
                .build();
    }
}
