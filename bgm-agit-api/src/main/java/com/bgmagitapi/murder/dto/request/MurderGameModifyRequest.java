package com.bgmagitapi.murder.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

/**
 * 머미 게임 수정 (multipart/form-data).
 * - image 가 있으면 기존 이미지를 교체.
 * - removeImage=true 면 기존 이미지 삭제.
 */
@Data
public class MurderGameModifyRequest {

    @NotBlank(message = "게임명을 입력해주세요.")
    private String name;

    private Integer minPlayers;
    private Integer maxPlayers;
    private Integer playMinutes;

    private MultipartFile image;
    private Boolean removeImage;
}
