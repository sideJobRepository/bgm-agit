package com.bgmagitapi.origin.clocktower.dto.request;

import lombok.Data;

/**
 * 게임 등록/수정 시 characters JSON 배열의 한 항목.
 * type 은 ClockTowerCharacterType 코드값(TOWNSFOLK/OUTSIDER/MINION/DEMON/TRAVELLER/FABLED/LORIC).
 * roleKey 는 캐릭터 사전에서 온 캐릭터면 그 키(수정 저장 때 그대로 돌려보내야 사전 연결이 유지된다).
 */
@Data
public class ClockTowerCharacterInput {
    private String name;
    private String type;
    private String description;
    private String roleKey;
}
