package com.bgmagitapi.kml.yakuman.dto.response;


import com.querydsl.core.annotations.QueryProjection;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class YakumanDetailGetResponse {

    private String nickname;
    private String yakumanName;
    private String yakumanCont;
    private String fileUrl;
    
    @QueryProjection
    public YakumanDetailGetResponse(String nickname, String yakumanName, String yakumanCont, String fileUrl) {
        this.nickname = nickname;
        this.yakumanName = yakumanName;
        this.yakumanCont = yakumanCont;
        this.fileUrl = fileUrl;
    }
}
