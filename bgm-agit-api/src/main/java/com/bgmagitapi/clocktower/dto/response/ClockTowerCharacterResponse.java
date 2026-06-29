package com.bgmagitapi.clocktower.dto.response;

import com.bgmagitapi.clocktower.entity.BgmAgitClockTowerCharacter;
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

    public static ClockTowerCharacterResponse of(BgmAgitClockTowerCharacter c) {
        return ClockTowerCharacterResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .type(c.getCharacterType() != null ? c.getCharacterType().name() : null)
                .typeName(c.getCharacterType() != null ? c.getCharacterType().getValue() : null)
                .description(c.getDescription())
                .orders(c.getOrders())
                .build();
    }
}
