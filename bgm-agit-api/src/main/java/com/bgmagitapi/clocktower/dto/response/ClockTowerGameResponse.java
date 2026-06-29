package com.bgmagitapi.clocktower.dto.response;

import com.bgmagitapi.clocktower.entity.BgmAgitClockTowerGame;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ClockTowerGameResponse {

    private Long id;
    private String name;
    private Integer minPlayers;
    private Integer maxPlayers;
    private Integer playMinutes;
    private String imageUrl;

    // 상세 조회 시에만 채움 (목록/simple 에서는 null)
    private List<ClockTowerCharacterResponse> characters;

    public static ClockTowerGameResponse of(BgmAgitClockTowerGame g) {
        return ClockTowerGameResponse.builder()
                .id(g.getId())
                .name(g.getName())
                .minPlayers(g.getMinPlayers())
                .maxPlayers(g.getMaxPlayers())
                .playMinutes(g.getPlayMinutes())
                .imageUrl(g.getImageUrl())
                .build();
    }

    public static ClockTowerGameResponse of(BgmAgitClockTowerGame g, List<ClockTowerCharacterResponse> characters) {
        return ClockTowerGameResponse.builder()
                .id(g.getId())
                .name(g.getName())
                .minPlayers(g.getMinPlayers())
                .maxPlayers(g.getMaxPlayers())
                .playMinutes(g.getPlayMinutes())
                .imageUrl(g.getImageUrl())
                .characters(characters)
                .build();
    }
}
