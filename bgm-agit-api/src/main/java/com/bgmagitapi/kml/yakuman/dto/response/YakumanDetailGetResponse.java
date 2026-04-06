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
    private String fileUrl;
    private String registDate;
    
    @QueryProjection
    public YakumanDetailGetResponse(String nickname, String yakumanName, String yakumanCont, String fileUrl, LocalDateTime registDate) {
        this.nickname = nickname;
        this.yakumanName = yakumanName;
        this.yakumanCont = yakumanCont;
        this.fileUrl = fileUrl;
        this.registDate = registDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}
