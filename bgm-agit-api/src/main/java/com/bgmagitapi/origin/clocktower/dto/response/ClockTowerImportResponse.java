package com.bgmagitapi.origin.clocktower.dto.response;

import java.util.List;

/**
 * 공식 데이터 가져오기 결과.
 * @param keptEdited 관리자가 고친 문구라 한글을 덮어쓰지 않은 캐릭터 수
 * @param scripts    만들거나 갱신한 기본 스크립트 이름
 */
public record ClockTowerImportResponse(int total, int added, int updated, int keptEdited, int jinxes,
                                       List<String> scripts) {
}
