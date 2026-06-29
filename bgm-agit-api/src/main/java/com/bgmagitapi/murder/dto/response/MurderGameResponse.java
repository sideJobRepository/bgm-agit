package com.bgmagitapi.murder.dto.response;

import com.bgmagitapi.murder.entity.BgmAgitMurderGame;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MurderGameResponse {

    private Long id;
    private String name;
    private Integer minPlayers;
    private Integer maxPlayers;
    private Integer playMinutes;
    private String imageUrl;

    public static MurderGameResponse of(BgmAgitMurderGame g) {
        return MurderGameResponse.builder()
                .id(g.getId())
                .name(g.getName())
                .minPlayers(g.getMinPlayers())
                .maxPlayers(g.getMaxPlayers())
                .playMinutes(g.getPlayMinutes())
                .imageUrl(g.getImageUrl())
                .build();
    }
}
