package com.bgmagitapi.origin.clocktower.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

/**
 * 시계탑 게임(시나리오) 등록 (multipart/form-data).
 * characters 는 JSON 문자열: [{ "name": "...", "type": "TOWNSFOLK", "description": "..." }, ...]
 */
@Data
public class ClockTowerGameCreateRequest {

    @NotBlank(message = "게임명을 입력해주세요.")
    private String name;

    private Integer minPlayers;
    private Integer maxPlayers;
    private Integer playMinutes;

    private MultipartFile image;

    // 캐릭터 목록 (JSON 문자열)
    private String characters;
}
