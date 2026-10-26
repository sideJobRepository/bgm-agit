package com.bgmagitapi.origin.clocktower.entity;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerResult;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
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

    // 진행판이 이야기꾼 메모를 붙여 보내 길어질 수 있다(예전 varchar(100) 은 저장 실패를 냈다)
    @Column(name = "BGM_AGIT_CLOCKTOWER_RECORD_MEMO", columnDefinition = "TEXT")
    private String memo;

    // 임시저장 여부: TRUE=임시저장(랭킹·통계 제외), FALSE/NULL=완료
    @Column(name = "BGM_AGIT_CLOCKTOWER_RECORD_DRAFT_STATUS")
    private Boolean draft;

    // 게임이 끝났을 때의 마도서(JSON). 기록 상세의 [마도서 보기]가 그대로 그린다. 직접 등록한 기록은 null
    @Column(name = "BGM_AGIT_CLOCKTOWER_RECORD_GRIMOIRE", columnDefinition = "LONGTEXT")
    private String grimoire;

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

    /** 마도서가 기록을 남길 때 마지막 마도서를 같이 붙인다 */
    public void attachGrimoire(String grimoire) {
        this.grimoire = grimoire;
    }

    public void update(BgmAgitClockTowerGame game, LocalDate playDate, ClockTowerResult result, String memo, boolean draft) {
        this.game = game;
        this.playDate = playDate;
        this.result = result;
        this.memo = memo;
        this.draft = draft;
    }
}
