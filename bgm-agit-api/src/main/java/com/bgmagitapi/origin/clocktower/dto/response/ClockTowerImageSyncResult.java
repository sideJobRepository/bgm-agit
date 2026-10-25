package com.bgmagitapi.origin.clocktower.dto.response;

/**
 * 이미지 한 장 복사 결과.
 * @param status COPIED(복사함) / SKIPPED(이미 있음·원본에 없음) / FAILED(재시도까지 실패) / NOT_RUN(시간 예산 초과로 이번엔 안 함)
 */
public record ClockTowerImageSyncResult(String path, String status, String message) {
}
