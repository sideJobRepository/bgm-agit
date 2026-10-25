package com.bgmagitapi.origin.clocktower.entity;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 시계탑 세션 참가자: 세션당 회원 1행.
 * 캐릭터명·역할군은 기록 시점의 스냅샷(시나리오 캐릭터 목록이 바뀌어도 과거 기록 불변).
 * 개인 승패 = 역할군 팀(선/악)이 세션 결과와 일치하면 승.
 * EVIL(Y/N) 이 있으면 역할군보다 우선한다 — 게임 중 진영이 바뀐 경우(뱀 부리는 사람 등)·여행자.
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

    // 최종 선악 Y/N. null 이면 역할군대로 판정
    @Column(name = "BGM_AGIT_CLOCKTOWER_PARTICIPANT_EVIL")
    private String evil;

    public BgmAgitClockTowerParticipant(BgmAgitClockTowerRecord record,
                                        BgmAgitMember bgmAgitMember,
                                        String characterName,
                                        ClockTowerCharacterType characterType,
                                        Boolean evil) {
        this.record = record;
        this.bgmAgitMember = bgmAgitMember;
        this.characterName = characterName;
        this.characterType = characterType;
        this.evil = evil == null ? null : (evil ? "Y" : "N");
    }

    /** 최종 선악. 직접 지정이 우선, 없으면 역할군(여행자·전설 등 선악이 정해지지 않은 역할군은 null) */
    public Boolean resolveEvil() {
        if (evil != null) return "Y".equals(evil);
        if (characterType == null || characterType == ClockTowerCharacterType.TRAVELLER || !characterType.isSeatable()) {
            return null;
        }
        return characterType.isEvil();
    }
}
