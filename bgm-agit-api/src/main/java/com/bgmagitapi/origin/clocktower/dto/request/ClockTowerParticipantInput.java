package com.bgmagitapi.origin.clocktower.dto.request;

import lombok.Data;

/** 기록 등록/수정 시 참가자 1명: 회원 + 선택한 캐릭터(시나리오 캐릭터 id). characterId null 허용.
 *  storyteller=true 이면 진행자(이야기꾼)로 저장되며 캐릭터·진영·승패가 없다. */
@Data
public class ClockTowerParticipantInput {
    private Long memberId;
    private Long characterId;
    private boolean storyteller;
    // 최종 선악(진행판에서 진영이 바뀐 경우·여행자). null 이면 캐릭터 진영대로
    private Boolean evil;
    // 캐릭터 사전 키. 게임 수정·공식 데이터 재가져오기로 characterId 가 바뀌어도 (게임, roleKey) 로 다시 찾는다
    private String roleKey;
}
