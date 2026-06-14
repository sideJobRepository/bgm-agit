package com.bgmagitapi.kml.sanbaeman.dto.response;


import com.querydsl.core.annotations.QueryProjection;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SanbaemanPivotResponse {

    private Long memberId;
    private String nickname;
    // 회원별 삼배만 총 횟수
    private Long totalCount;

    @QueryProjection
    public SanbaemanPivotResponse(Long memberId, String nickname, Long totalCount) {
        this.memberId = memberId;
        this.nickname = nickname;
        this.totalCount = totalCount;
    }
}
