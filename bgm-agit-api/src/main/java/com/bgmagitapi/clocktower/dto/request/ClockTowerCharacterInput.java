package com.bgmagitapi.clocktower.dto.request;

import lombok.Data;

/**
 * 게임 등록/수정 시 characters JSON 배열의 한 항목.
 * type 은 ClockTowerCharacterType 코드값(TOWNSFOLK/OUTSIDER/MINION/DEMON).
 */
@Data
public class ClockTowerCharacterInput {
    private String name;
    private String type;
    private String description;
}
