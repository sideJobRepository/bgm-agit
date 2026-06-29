package com.bgmagitapi.clocktower.entity;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.ClockTowerResult;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 시계탑 플레이 세션: 게임 1개 + 날짜 + 작성자 + 결과(선인승/악마승).
 * 참가자는 BgmAgitClockTowerParticipant 로 N명.
 */
@Entity
@Table(name = "BGM_AGIT_CLOCKTOWER_RECORD")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitClockTowerRecord extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_CLOCKTOWER_RECORD_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_CLOCKTOWER_GAME_ID")
    private BgmAgitClockTowerGame game;

    // 기록 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;

    @Column(name = "BGM_AGIT_CLOCKTOWER_RECORD_DATE")
    private LocalDate playDate;

    @Column(name = "BGM_AGIT_CLOCKTOWER_RECORD_RESULT")
    @Enumerated(EnumType.STRING)
    private ClockTowerResult result;

    @Column(name = "BGM_AGIT_CLOCKTOWER_RECORD_MEMO")
    private String memo;

    // 임시저장 여부: TRUE=임시저장(랭킹·통계 제외), FALSE/NULL=완료
    @Column(name = "BGM_AGIT_CLOCKTOWER_RECORD_DRAFT_STATUS")
    private Boolean draft;

    public BgmAgitClockTowerRecord(BgmAgitClockTowerGame game,
                                   BgmAgitMember bgmAgitMember,
                                   LocalDate playDate,
                                   ClockTowerResult result,
                                   String memo,
                                   boolean draft) {
        this.game = game;
        this.bgmAgitMember = bgmAgitMember;
        this.playDate = playDate;
        this.result = result;
        this.memo = memo;
        this.draft = draft;
    }

    public void update(BgmAgitClockTowerGame game, LocalDate playDate, ClockTowerResult result, String memo, boolean draft) {
        this.game = game;
        this.playDate = playDate;
        this.result = result;
        this.memo = memo;
        this.draft = draft;
    }
}
