package com.bgmagitapi.clocktower.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

/**
 * 시계탑 게임 수정 (multipart/form-data).
 * - image 가 있으면 기존 이미지 교체, removeImage=true 면 제거.
 * - characters JSON 으로 캐릭터 목록 전체 재구성.
 */
@Data
public class ClockTowerGameModifyRequest {

    @NotBlank(message = "게임명을 입력해주세요.")
    private String name;

    private Integer minPlayers;
    private Integer maxPlayers;
    private Integer playMinutes;

    private MultipartFile image;
    private Boolean removeImage;

    private String characters;
}
