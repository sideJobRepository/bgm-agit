package com.bgmagitapi.origin.murder.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

/**
 * 머미 게임 등록 (multipart/form-data, 커버 이미지 선택).
 */
@Data
public class MurderGameCreateRequest {

    @NotBlank(message = "게임명을 입력해주세요.")
    private String name;

    private Integer minPlayers;
    private Integer maxPlayers;
    private Integer playMinutes;

    // 커버 이미지 (선택)
    private MultipartFile image;

    // 이미지 주소. image 가 없을 때만 서버가 받아와 올린다(브라우저 fetch 는 CORS 로 막혀서)
    private String imageSourceUrl;
}
