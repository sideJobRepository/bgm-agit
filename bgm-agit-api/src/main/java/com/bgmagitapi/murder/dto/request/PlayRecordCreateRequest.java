package com.bgmagitapi.murder.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 플레이 기록 등록.
 * - memberIds: 참가자 회원 ID (작성자는 서비스에서 자동 포함).
 */
@Data
public class PlayRecordCreateRequest {

    @NotNull(message = "게임을 선택해주세요.")
    private Long gameId;

    @NotNull(message = "플레이 날짜를 선택해주세요.")
    private LocalDate playDate;

    private List<Long> memberIds;

    private String memo;
}
