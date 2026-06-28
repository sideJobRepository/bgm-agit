package com.bgmagitapi.entity.enumeration;

import lombok.Getter;

/**
 * 참가자 상태 (모임 성사 상태와 별개)
 * CONFIRMED : 참가 (정원 이내, 자리 확보)
 * WAITING   : 대기 (정원 초과, 선착순 대기열)
 * NOSHOW    : 노쇼 (행사 당일 안 온 사람 — 관리자 체크)
 * CANCELLED : 신청 취소
 */
@Getter
public enum GatheringParticipantStatus {

    CONFIRMED("참가"),
    WAITING("대기"),
    NOSHOW("노쇼"),
    CANCELLED("취소");

    private final String value;

    GatheringParticipantStatus(String value) {
        this.value = value;
    }
}
