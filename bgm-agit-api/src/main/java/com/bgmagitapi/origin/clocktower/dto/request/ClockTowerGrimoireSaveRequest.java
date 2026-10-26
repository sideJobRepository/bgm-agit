package com.bgmagitapi.origin.clocktower.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 마도서 임시저장. id 가 있으면 그 저장을 덮어쓴다(같은 판을 다시 저장), 없으면 새로 만든다.
 */
@Data
public class ClockTowerGrimoireSaveRequest {

    private Long id;

    private Long gameId;

    @Size(max = 200, message = "제목은 200자까지입니다.")
    private String title;

    @NotBlank(message = "저장할 마도서가 없습니다.")
    @Size(max = ClockTowerGrimoireSaveRequest.MAX_STATE, message = "마도서가 너무 큽니다.")
    private String state;

    // 스크립트 데이터까지 들어 보통 수십 KB. 넉넉히 잡되 끝없이 받지는 않는다
    public static final int MAX_STATE = 3_000_000;
}
