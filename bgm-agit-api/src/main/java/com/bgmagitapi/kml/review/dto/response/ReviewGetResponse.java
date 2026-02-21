package com.bgmagitapi.kml.review.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.querydsl.core.annotations.QueryProjection;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@NoArgsConstructor
@Data
public class ReviewGetResponse {
    
    private Long id;
    private String title;
    private String cont;
    private Long memberId;
    private String memberName;
    private String nickname;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDateTime registDate;
    private Long commentCount;
    
    @QueryProjection
    public ReviewGetResponse(Long id, String title, String cont, Long memberId, String memberName, String nickname, LocalDateTime registDate, Long commentCount) {
        this.id = id;
        this.title = title;
        this.cont = cont;
        this.memberId = memberId;
        this.memberName = memberName;
        this.nickname = nickname;
        this.registDate = registDate;
        this.commentCount = commentCount;
    }
}
