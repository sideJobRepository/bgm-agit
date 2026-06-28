package com.bgmagitapi.controller.request;

import lombok.Getter;

/**
 * 관리자: 참가자 상태 변경 (입금체크 / 참석 / 노쇼 / 유연 끌어오기)
 * - 변경할 항목만 채워서 보냄 (null 은 변경 안 함)
 */
@Getter
public class BgmAgitGatheringParticipantUpdateRequest {

    // CONFIRMED / WAITING / NOSHOW / CANCELLED
    private String participantStatus;

    private Boolean flexible;
}
