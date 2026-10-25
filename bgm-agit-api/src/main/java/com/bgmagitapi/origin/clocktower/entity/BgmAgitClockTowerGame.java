package com.bgmagitapi.origin.clocktower.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 시계탑 게임(시나리오) 카탈로그.
 * 캐릭터는 BgmAgitClockTowerCharacter 로 시나리오별 N개.
 * SOURCE: MANUAL(관리자가 직접 입력) / OFFICIAL(공식 기본 스크립트, 가져오기가 관리) / CUSTOM(스크립트 JSON 으로 등록)
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

    @Column(name = "BGM_AGIT_CLOCKTOWER_GAME_SOURCE")
    private String source;

    // 공식 기본 스크립트의 판본 키(tb/bmr/snv). 가져오기가 이 값으로 같은 게임을 찾아 갱신한다
    @Column(name = "BGM_AGIT_CLOCKTOWER_GAME_SCRIPT_KEY")
    private String scriptKey;

    @Column(name = "BGM_AGIT_CLOCKTOWER_GAME_AUTHOR")
    private String author;

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
        this.source = "MANUAL";
    }

    /** 공식 기본 스크립트 / 스크립트 JSON 으로 만드는 게임 */
    public static BgmAgitClockTowerGame ofScript(String name, String source, String scriptKey, String author,
                                                 Integer minPlayers, Integer maxPlayers) {
        BgmAgitClockTowerGame game = new BgmAgitClockTowerGame(name, minPlayers, maxPlayers, null, null);
        game.source = source;
        game.scriptKey = scriptKey;
        game.author = author;
        return game;
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

    public void rename(String name) {
        this.name = name;
    }

    public void restore() {
        this.useStatus = "Y";
    }

    public void softDelete() {
        this.useStatus = "N";
    }
}
