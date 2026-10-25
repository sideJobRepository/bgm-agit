package com.bgmagitapi.origin.clocktower.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * 캐릭터 이미지 복사(관리자). paths 는 상태 조회가 내려준 missing 경로 그대로(한 번에 30개까지 — nginx 타임아웃).
 * force 면 이미 복사한 것도 다시 받는다.
 */
@Data
public class ClockTowerImageSyncRequest {

    @NotEmpty(message = "복사할 이미지를 골라 주세요.")
    @Size(max = 30, message = "한 번에 30개까지 복사할 수 있습니다.")
    private List<String> paths;

    private boolean force;
}
