package com.bgmagitapi.origin.clocktower.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 커스텀 스크립트 등록(관리자). json 은 공식 스크립트 도구 형식 배열 그대로.
 * name 을 주면 JSON 의 _meta 이름 대신 쓴다(_meta 가 없으면 필수).
 */
@Data
public class ClockTowerScriptCreateRequest {

    @NotBlank(message = "스크립트 JSON 을 붙여넣어 주세요.")
    private String json;

    private String name;
    private Integer minPlayers;
    private Integer maxPlayers;
}
