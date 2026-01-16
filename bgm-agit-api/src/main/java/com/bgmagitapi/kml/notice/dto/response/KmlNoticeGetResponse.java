package com.bgmagitapi.kml.notice.dto.response;


import com.querydsl.core.annotations.QueryProjection;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
public class KmlNoticeGetResponse {
    
    private Long id;
    private String title;
    private String cont;
    

    @QueryProjection
    public KmlNoticeGetResponse(Long id, String title, String cont) {
        this.id = id;
        this.title = title;
        this.cont = cont;
    }
}
