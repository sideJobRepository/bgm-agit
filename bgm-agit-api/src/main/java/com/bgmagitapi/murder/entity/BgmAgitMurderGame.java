package com.bgmagitapi.murder.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 머미(머더미스터리) 게임 카탈로그.
 * - 인원수는 게임마다 다름 → 최소/최대 두 컬럼. 단일 정원이면 min=max.
 * - 커버 이미지는 선택(S3 URL).
 */
@Entity
@Table(name = "BGM_AGIT_MURDER_GAME")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitMurderGame extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_MURDER_GAME_ID")
    private Long id;

    @Column(name = "BGM_AGIT_MURDER_GAME_NAME")
    private String name;

    @Column(name = "BGM_AGIT_MURDER_GAME_MIN_PLAYERS")
    private Integer minPlayers;

    @Column(name = "BGM_AGIT_MURDER_GAME_MAX_PLAYERS")
    private Integer maxPlayers;

    @Column(name = "BGM_AGIT_MURDER_GAME_PLAY_MINUTES")
    private Integer playMinutes;

    @Column(name = "BGM_AGIT_MURDER_GAME_IMAGE_URL")
    private String imageUrl;

    // 사용 여부 Y/N (소프트 삭제)
    @Column(name = "BGM_AGIT_MURDER_GAME_USE_STATUS")
    private String useStatus;

    public BgmAgitMurderGame(String name,
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
