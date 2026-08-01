package com.bgmagitapi.origin.clocktower.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 시계탑 게임(시나리오) 카탈로그.
 * 캐릭터는 BgmAgitClockTowerCharacter 로 시나리오별 N개.
 */
@Entity
@Table(name = "BGM_AGIT_CLOCKTOWER_GAME")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitClockTowerGame extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_CLOCKTOWER_GAME_ID")
    private Long id;

    @Column(name = "BGM_AGIT_CLOCKTOWER_GAME_NAME")
    private String name;

    @Column(name = "BGM_AGIT_CLOCKTOWER_GAME_MIN_PEOPLE")
    private Integer minPlayers;

    @Column(name = "BGM_AGIT_CLOCKTOWER_GAME_MAX_PEOPLE")
    private Integer maxPlayers;

    @Column(name = "BGM_AGIT_CLOCKTOWER_GAME_PLAY_TIME")
    private Integer playMinutes;

    @Column(name = "BGM_AGIT_CLOCKTOWER_GAME_IMAGE_URL")
    private String imageUrl;

    // 사용 여부 Y/N (소프트 삭제)
    @Column(name = "BGM_AGIT_CLOCKTOWER_USE_STATUS")
    private String useStatus;

    public BgmAgitClockTowerGame(String name,
                                 Integer minPlayers,
                                 Integer maxPlayers,
                                 Integer playMinutes,
                                 String imageUrl) {
        this.name = name;
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.playMinutes = playMinutes;
        this.imageUrl = imageUrl;
        this.useStatus = "Y";
    }

    public void update(String name,
                       Integer minPlayers,
                       Integer maxPlayers,
                       Integer playMinutes) {
        this.name = name;
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.playMinutes = playMinutes;
    }

    public void changeImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void softDelete() {
        this.useStatus = "N";
    }
}
