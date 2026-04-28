package com.bgmagitapi.kml.yakuman.dto.response;


import com.querydsl.core.annotations.QueryProjection;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
public class YakumanDetailGetResponse {

    private String nickname;
    private String yakumanName;
    private String yakumanCont;
    // legacy: BgmAgitCommonFile 의 풀 URL
    private String fileUrl;
    // new: BgmAgitFile 의 ID. 프론트가 /bgm-agit/file-view 로 presigned URL 조회
    private Long fileId;
    private String registDate;

    @QueryProjection
    public YakumanDetailGetResponse(String nickname, String yakumanName, String yakumanCont, String fileUrl, Long fileId, LocalDateTime registDate) {
        this.nickname = nickname;
        this.yakumanName = yakumanName;
        this.yakumanCont = yakumanCont;
        this.fileUrl = fileUrl;
        this.fileId = fileId;
        this.registDate = registDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}
