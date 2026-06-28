package com.bgmagitapi.event.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 모임 취소(무산) 알림 (참가/대기 참가자 전원) */
@Getter
@AllArgsConstructor
public class GatheringCancelledEvent {

    private final Long gatheringId;
}
