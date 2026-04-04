package com.bgmagitapi.kml.rank.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RankGetResponse {
    
    private Long memberId;
    private String memberNickname;
    private Double recordSumPoint;
    private Integer totalCount;
    
    private Integer rank;

    
    public RankGetResponse(Long memberId, String memberNickname, Double recordSumPoint, Integer totalCount) {
        this.memberId = memberId;
        this.memberNickname = memberNickname;
        this.recordSumPoint = recordSumPoint;
        this.totalCount = totalCount;
    }
}
