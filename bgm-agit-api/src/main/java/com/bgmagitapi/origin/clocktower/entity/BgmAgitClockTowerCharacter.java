package com.bgmagitapi.origin.clocktower.entity;

import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 시계탑 시나리오별 캐릭터 (이름 + 역할군 + 능력 설명 고정).
 * 기록 시 참가자가 이 목록에서 선택하며, 참가자에는 이름·역할군이 스냅샷으로 복사된다.
 */
@Entity
@Table(name = "BGM_AGIT_CLOCKTOWER_CHARACTER")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitClockTowerCharacter extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_CLOCKTOWER_CHARACTER_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_CLOCKTOWER_GAME_ID")
    private BgmAgitClockTowerGame game;

    @Column(name = "BGM_AGIT_CLOCKTOWER_CHARACTER_NAME")
    private String name;

    @Column(name = "BGM_AGIT_CLOCKTOWER_CHARACTER_TYPE")
    @Enumerated(EnumType.STRING)
    private ClockTowerCharacterType characterType;

    @Column(name = "BGM_AGIT_CLOCKTOWER_CHARACTER_DESCRIPTION")
    private String description;

    @Column(name = "BGM_AGIT_CLOCKTOWER_CHARACTER_ORDERS")
    private Integer orders;

    public BgmAgitClockTowerCharacter(BgmAgitClockTowerGame game,
                                      String name,
                                      ClockTowerCharacterType characterType,
                                      String description,
                                      Integer orders) {
        this.game = game;
        this.name = name;
        this.characterType = characterType;
        this.description = description;
        this.orders = orders;
    }
}
