package com.bgmagitapi.origin.clocktower.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 캐릭터 사전 한글 문구 수정(관리자). 고친 캐릭터는 다시 가져오기에서 덮어쓰지 않는다 */
@Data
public class ClockTowerRoleModifyRequest {

    @NotBlank(message = "이름을 입력해주세요.")
    private String name;

    private String ability;
    private String firstNightText;
    private String otherNightText;
}
