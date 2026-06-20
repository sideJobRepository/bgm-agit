package com.bgmagitapi.kml.sanbaeman.dto.response;


import com.querydsl.core.annotations.QueryProjection;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
public class SanbaemanDetailGetResponse {

    private String nickname;
    private String sanbaemanName;
    private String sanbaemanCont;
    // legacy: BgmAgitCommonFile 의 풀 URL
    private String fileUrl;
    // new: BgmAgitFile 의 ID. 프론트가 /bgm-agit/file-view 로 presigned URL 조회
    private Long fileId;
    // 이 삼배만이 나온 대국 ID (프론트에서 행 클릭 시 대국 결과 모달 조회용)
    private Long matchsId;
    private String registDate;

    @QueryProjection
    public SanbaemanDetailGetResponse(String nickname, String sanbaemanName, String sanbaemanCont, String fileUrl, Long fileId, Long matchsId, LocalDateTime registDate) {
        this.nickname = nickname;
        this.sanbaemanName = sanbaemanName;
        this.sanbaemanCont = sanbaemanCont;
        this.fileUrl = fileUrl;
        this.fileId = fileId;
        this.matchsId = matchsId;
        this.registDate = registDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}
