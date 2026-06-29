package com.bgmagitapi.murder.entity;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 플레이 세션 참가자: 세션당 회원 1행.
 * 회원별 월간 게임수 집계의 핵심 테이블.
 *
 * [시계탑 확장점] 추후 필드 추가만 하면 됨 (지금은 미생성):
 *   private String faction;   // 진영(악/시 승패)
 *   private String character; // 플레이 캐릭터
 */
@Entity
@Table(name = "BGM_AGIT_PLAY_RECORD_PARTICIPANT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitPlayRecordParticipant extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_PLAY_RECORD_PARTICIPANT_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_PLAY_RECORD_ID")
    private BgmAgitPlayRecord playRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;

    public BgmAgitPlayRecordParticipant(BgmAgitPlayRecord playRecord, BgmAgitMember bgmAgitMember) {
        this.playRecord = playRecord;
        this.bgmAgitMember = bgmAgitMember;
    }
}
