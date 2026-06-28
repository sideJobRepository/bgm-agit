package com.bgmagitapi.event.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 모임 성사 알림 (좌석확보 참가자 전원) */
@Getter
@AllArgsConstructor
public class GatheringConfirmedEvent {

    private final Long gatheringId;
}
