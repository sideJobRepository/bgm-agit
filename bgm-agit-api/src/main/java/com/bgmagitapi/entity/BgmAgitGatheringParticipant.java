package com.bgmagitapi.entity;

import com.bgmagitapi.entity.enumeration.GatheringParticipantStatus;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 모임 참가자 (좌석 상태)
 * - participantStatus : 좌석확보/대기/취소/참석/노쇼
 * - flexible          : 다른 장르도 가능 (시계탑↔머미 유연 참가 플래그)
 * - paymentStatus     : 관리자 입금 확인 체크 ('Y'/'N')
 */
@Entity
@Table(name = "BGM_AGIT_GATHERING_PARTICIPANT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitGatheringParticipant extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_GATHERING_PARTICIPANT_ID")
    private Long bgmAgitGatheringParticipantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_GATHERING_ID")
    private BgmAgitGathering bgmAgitGathering;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;

    @Column(name = "BGM_AGIT_GATHERING_PARTICIPANT_STATUS")
    @Enumerated(EnumType.STRING)
    private GatheringParticipantStatus participantStatus;

    // 다른 장르도 가능 (유연 참가)
    @Column(name = "BGM_AGIT_GATHERING_PARTICIPANT_FLEXIBLE")
    private Boolean flexible;

    // 선착순 순서
    @Column(name = "BGM_AGIT_GATHERING_PARTICIPANT_ORDERS")
    private Long appliedOrder;

    public BgmAgitGatheringParticipant(BgmAgitGathering gathering,
                                       BgmAgitMember member,
                                       GatheringParticipantStatus status,
                                       Boolean flexible,
                                       Long appliedOrder) {
        this.bgmAgitGathering = gathering;
        this.bgmAgitMember = member;
        this.participantStatus = status;
        this.flexible = flexible;
        this.appliedOrder = appliedOrder;
    }

    /** 취소된 신청을 같은 행으로 재신청 처리 */
    public void reapply(GatheringParticipantStatus status, Boolean flexible, Long appliedOrder) {
        this.participantStatus = status;
        this.flexible = flexible;
        this.appliedOrder = appliedOrder;
    }

    public void changeStatus(GatheringParticipantStatus status) {
        this.participantStatus = status;
    }

    public void changeFlexible(Boolean flexible) {
        this.flexible = flexible;
    }

    public void promoteToConfirmed() {
        this.participantStatus = GatheringParticipantStatus.CONFIRMED;
    }
}
