package com.bgmagitapi.clocktower.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 시계탑 기록 등록.
 * - result: GOOD_WIN / EVIL_WIN
 * - participants: 참가자 + 선택 캐릭터 (작성자는 서비스에서 자동 포함)
 */
@Data
public class ClockTowerRecordCreateRequest {

    @NotNull(message = "게임을 선택해주세요.")
    private Long gameId;

    @NotNull(message = "플레이 날짜를 선택해주세요.")
    private LocalDate playDate;

    // 임시저장(draft) 시 null 허용. 완료 저장 시 서비스에서 필수 검증.
    private String result;

    private List<ClockTowerParticipantInput> participants;

    private String memo;

    // true 면 임시저장(DRAFT). 결과·캐릭터 미완성 허용, 랭킹·통계 제외.
    private boolean draft;
}
