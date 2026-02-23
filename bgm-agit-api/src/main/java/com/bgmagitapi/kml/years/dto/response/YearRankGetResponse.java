package com.bgmagitapi.kml.years.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class YearRankGetResponse {
    
    
    private Integer year;
    private Integer requiredGames;
    private List<Ranking> rankings; // 연간 랭킹 목록
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Ranking {
        private Integer rank;          // 1,2,3...
        private Long memberId;
        private String nickname;
        
        private Double point;          // 합계 점수(또는 우마 포함 점수)
        private Integer matchCount;    // 대국 수(국수)
        
        private Long firstCount;
        private Long secondCount;
        private Long thirdCount;
        private Long fourthCount;
    }
}
