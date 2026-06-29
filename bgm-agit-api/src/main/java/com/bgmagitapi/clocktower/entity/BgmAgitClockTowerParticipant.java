package com.bgmagitapi.clocktower.entity;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.ClockTowerCharacterType;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 시계탑 세션 참가자: 세션당 회원 1행.
 * 캐릭터명·역할군은 기록 시점의 스냅샷(시나리오 캐릭터 목록이 바뀌어도 과거 기록 불변).
 * 개인 승패 = 역할군 팀(선/악)이 세션 결과와 일치하면 승.
 */
@Entity
@Table(name = "BGM_AGIT_CLOCKTOWER_PARTICIPANT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitClockTowerParticipant extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_CLOCKTOWER_PARTICIPANT_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_CLOCKTOWER_RECORD_ID")
    private BgmAgitClockTowerRecord record;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;

    @Column(name = "BGM_AGIT_CLOCKTOWER_PARTICIPANT_CHARACTER")
    private String characterName;

    @Column(name = "BGM_AGIT_CLOCKTOWER_PARTICIPANT_TYPE")
    @Enumerated(EnumType.STRING)
    private ClockTowerCharacterType characterType;

    public BgmAgitClockTowerParticipant(BgmAgitClockTowerRecord record,
                                        BgmAgitMember bgmAgitMember,
                                        String characterName,
                                        ClockTowerCharacterType characterType) {
        this.record = record;
        this.bgmAgitMember = bgmAgitMember;
        this.characterName = characterName;
        this.characterType = characterType;
    }
}
