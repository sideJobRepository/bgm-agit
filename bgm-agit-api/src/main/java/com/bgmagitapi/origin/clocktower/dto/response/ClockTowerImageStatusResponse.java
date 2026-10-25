package com.bgmagitapi.origin.clocktower.dto.response;

import java.util.List;

/**
 * 캐릭터 이미지 복사 현황.
 * @param missing 아직 우리 S3 에 없는 경로(예: tb/imp_e.webp, generic/townsfolk.webp)
 * @param paths   전체 경로([전체 다시 받기]가 force 로 보낸다)
 */
public record ClockTowerImageStatusResponse(int total, int done, List<String> missing, List<String> paths) {
}
