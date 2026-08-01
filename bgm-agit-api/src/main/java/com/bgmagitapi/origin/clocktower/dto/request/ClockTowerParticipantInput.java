package com.bgmagitapi.origin.clocktower.dto.request;

import lombok.Data;

/** 기록 등록/수정 시 참가자 1명: 회원 + 선택한 캐릭터(시나리오 캐릭터 id). characterId null 허용.
 *  storyteller=true 이면 진행자(이야기꾼)로 저장되며 캐릭터·진영·승패가 없다. */
@Data
public class ClockTowerParticipantInput {
    private Long memberId;
    private Long characterId;
    private boolean storyteller;
}
