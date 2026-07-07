package com.bgmagitapi.origin.murder.entity;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 플레이 세션: 머미 게임 1개 + 플레이 날짜 + 작성자.
 * 참가자는 BgmAgitPlayRecordParticipant 로 N명.
 * 월간 게임수 집계는 playDate(사용자 선택) 기준.
 */
@Entity
@Table(name = "BGM_AGIT_PLAY_RECORD")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitPlayRecord extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_PLAY_RECORD_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MURDER_GAME_ID")
    private BgmAgitMurderGame murderGame;

    // 기록 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;

    @Column(name = "BGM_AGIT_PLAY_RECORD_DATE")
    private LocalDate playDate;

    @Column(name = "BGM_AGIT_PLAY_RECORD_MEMO")
    private String memo;

    public BgmAgitPlayRecord(BgmAgitMurderGame murderGame,
                             BgmAgitMember bgmAgitMember,
                             LocalDate playDate,
                             String memo) {
        this.murderGame = murderGame;
        this.bgmAgitMember = bgmAgitMember;
        this.playDate = playDate;
        this.memo = memo;
    }

    public void update(BgmAgitMurderGame murderGame, LocalDate playDate, String memo) {
        this.murderGame = murderGame;
        this.playDate = playDate;
        this.memo = memo;
    }
}
