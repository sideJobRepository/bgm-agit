package com.bgmagitapi.murder.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 플레이 기록 수정 (게임/날짜/참가자/메모 교체).
 */
@Data
public class PlayRecordModifyRequest {

    @NotNull(message = "게임을 선택해주세요.")
    private Long gameId;

    @NotNull(message = "플레이 날짜를 선택해주세요.")
    private LocalDate playDate;

    private List<Long> memberIds;

    private String memo;
}
