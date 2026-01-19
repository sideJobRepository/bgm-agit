package com.bgmagitapi.kml.notice.dto.response;


import com.querydsl.core.annotations.QueryProjection;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class KmlNoticeGetResponse {
    
    private Long id;
    private String title;
    private String cont;
    private LocalDate registDate;
    
    
    @QueryProjection
    public KmlNoticeGetResponse(Long id, String title, String cont, LocalDateTime registDate) {
        this.id = id;
        this.title = title;
        this.cont = cont;
        this.registDate = registDate.toLocalDate();
    }
}
