package com.bgmagitapi.origin.clocktower.entity;

import com.bgmagitapi.origin.clocktower.util.ClockTowerImagePaths;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 시계탑 캐릭터 사전. 공식 데이터(release.botc.app + 공식 한국어 번역)를 가져와 채운다.
 * - ROLE_KEY: 공식 영문 id(fortuneteller 등). 커스텀 스크립트 JSON 이 이 값으로 캐릭터를 가리킨다.
 *   스크립트 전용 자작 캐릭터는 "g{게임ID}:{id}" 로 저장해 공식 id 와 겹치지 않게 한다.
 * - 밤 특수 단계(dusk·minioninfo·demoninfo·dawn)도 같은 표에 둔다. team 이 null 이다.
 * - 한글 문구를 관리자가 고치면 CUSTOM_EDITED='Y' 가 되고, 다시 가져오기가 한글 문구를 덮어쓰지 않는다.
 */
@Entity
@Table(name = "BGM_AGIT_CLOCKTOWER_ROLE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitClockTowerRole extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_ID")
    private Long id;

    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_KEY")
    private String roleKey;

    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_NAME")
    private String name;

    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_NAME_EN")
    private String nameEn;

    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_TEAM")
    @Enumerated(EnumType.STRING)
    private ClockTowerCharacterType team;

    // tb / bmr / snv / carousel / fabled / loric / night(밤 특수 단계) / homebrew
    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_EDITION")
    private String edition;

    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_ABILITY")
    private String ability;

    // 밤 순서(1부터). null 이면 그 밤에 깨우지 않는다
    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_FIRST_NIGHT_ORDER")
    private Integer firstNightOrder;

    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_OTHER_NIGHT_ORDER")
    private Integer otherNightOrder;

    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_FIRST_NIGHT_TEXT")
    private String firstNightText;

    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_OTHER_NIGHT_TEXT")
    private String otherNightText;

    // 리마인더 토큰 문구 JSON 배열 문자열(한글). GLOBAL 은 다른 플레이어에게도 붙일 수 있는 것(예: "주정뱅이임")
    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_REMINDERS")
    private String reminders;

    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_REMINDERS_GLOBAL")
    private String remindersGlobal;

    // 셋업(진영 인원수)을 바꾸는 캐릭터인지 Y/N (남작 등)
    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_SETUP")
    private String setup;

    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_CUSTOM_EDITED")
    private String customEdited;

    // 자작 캐릭터가 속한 스크립트(게임). 공식 캐릭터는 null
    @Column(name = "BGM_AGIT_CLOCKTOWER_GAME_ID")
    private Long gameId;

    // 토큰 이미지. 공식은 우리 S3 복사본, 자작은 스크립트 JSON 의 원본 주소. 공식 데이터 가져오기(applyOfficial)는 건드리지 않는다
    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_IMAGE_URL")
    private String imageUrl;

    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_IMAGE_GOOD_URL")
    private String imageGoodUrl;

    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_IMAGE_EVIL_URL")
    private String imageEvilUrl;

    // 마지막으로 S3 에 복사한 시각(자작은 null)
    @Column(name = "BGM_AGIT_CLOCKTOWER_ROLE_IMAGE_SYNCED_AT")
    private LocalDateTime imageSyncedAt;

    public BgmAgitClockTowerRole(String roleKey, Long gameId) {
        this.roleKey = roleKey;
        this.gameId = gameId;
        this.customEdited = "N";
    }

    /** 공식 데이터 반영. 영문·순서·진영은 늘 갱신하고, 한글 문구는 관리자가 고치지 않았을 때만 갱신한다 */
    public void applyOfficial(String nameEn,
                              ClockTowerCharacterType team,
                              String edition,
                              Integer firstNightOrder,
                              Integer otherNightOrder,
                              boolean setup,
                              String name,
                              String ability,
                              String firstNightText,
                              String otherNightText,
                              String reminders,
                              String remindersGlobal) {
        this.nameEn = nameEn;
        this.team = team;
        this.edition = edition;
        this.firstNightOrder = firstNightOrder;
        this.otherNightOrder = otherNightOrder;
        this.setup = setup ? "Y" : "N";
        this.reminders = reminders;
        this.remindersGlobal = remindersGlobal;
        if (!isCustomEdited()) {
            this.name = name;
            this.ability = ability;
            this.firstNightText = firstNightText;
            this.otherNightText = otherNightText;
        }
    }

    /** 관리자 수정. 이후 공식 데이터를 다시 가져와도 이 문구를 지킨다 */
    public void editText(String name, String ability, String firstNightText, String otherNightText) {
        this.name = name;
        this.ability = ability;
        this.firstNightText = firstNightText;
        this.otherNightText = otherNightText;
        this.customEdited = "Y";
    }

    /** 수정 표시만 풀어 다음 가져오기 때 공식 문구로 돌아가게 한다 */
    public void clearCustomEdited() {
        this.customEdited = "N";
    }

    /** S3 에 복사한 공식 이미지 한 장 반영 */
    public void applySyncedImage(ClockTowerImagePaths.Variant variant, String url, LocalDateTime syncedAt) {
        switch (variant) {
            case PLAIN -> this.imageUrl = url;
            case GOOD -> this.imageGoodUrl = url;
            case EVIL -> this.imageEvilUrl = url;
        }
        this.imageSyncedAt = syncedAt;
    }

    /** 자작 캐릭터 이미지(원본 주소 그대로, 검사는 ClockTowerImagePaths.safeExternalUrl) */
    public void applyHomebrewImages(String imageUrl, String imageGoodUrl, String imageEvilUrl) {
        this.imageUrl = imageUrl;
        this.imageGoodUrl = imageGoodUrl;
        this.imageEvilUrl = imageEvilUrl;
    }

    /** 그 갈래 이미지가 이미 있는지(복사 상태 판정) */
    public boolean hasImage(ClockTowerImagePaths.Variant variant) {
        return switch (variant) {
            case PLAIN -> imageUrl != null;
            case GOOD -> imageGoodUrl != null;
            case EVIL -> imageEvilUrl != null;
        };
    }

    public boolean isCustomEdited() {
        return "Y".equals(customEdited);
    }
}
