package com.bgmagitapi.entity.enumeration;

import lombok.Getter;

/**
 * 모임 성사 상태 (참가자 좌석 상태와 별개)
 * RECRUITING : 모집중 (최소 인원 미달)
 * CONFIRMED  : 성사 (최소 인원 달성)
 * CANCELLED  : 무산 (관리자가 마감 미달 모임을 취소)
 * COMPLETED  : 종료 (행사 완료)
 */
@Getter
public enum GatheringStatus {

    RECRUITING("모집중"),
    CONFIRMED("성사"),
    CANCELLED("무산"),
    COMPLETED("종료");

    private final String value;

    GatheringStatus(String value) {
        this.value = value;
    }
}
