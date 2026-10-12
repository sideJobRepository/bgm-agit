package com.bgmagitapi.origin.murder.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

/**
 * 표지 정리 화면에서 표지 하나 넣기 (multipart/form-data).
 * - image 가 있으면 파일, 없으면 imageSourceUrl(이미지·페이지 주소)을 서버가 받아온다
 * - name 이 있으면 게임명도 바꾸고, 인원·시간은 비어 있는 칸만 채운다(머미로그 제목·정보로 맞출 때)
 */
@Data
public class MurderCoverApplyRequest {

    private MultipartFile image;
    private String imageSourceUrl;

    private String name;
    private Integer minPlayers;
    private Integer maxPlayers;
    private Integer playMinutes;
}
