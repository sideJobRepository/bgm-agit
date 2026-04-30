package com.bgmagitapi.kml.rank.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RankGetResponse {
    // ===== 기본 정보 =====
    private Long memberId;
    private Integer rank;              // 순위
    private String memberNickname;     // 이름
// 단위는 따로 없으면 제거 or 필요하면 추가
    
    private Double recordSumPoint;     // 총점
    private Double pointRate;          // 총점% (증감%) ← 있으면 사용
    
    // ===== 비율 =====
    private Double firstRate;          // 1%
    private Double top2Rate;           // 12%
    private Double plusRate;           // +%
    private Double minus2Rate;         // -2%
    private Double plus3Rate;          // +3%
    private Double fourthRate;         // 4%
    
    // ===== 토비 =====
    private Double tobiRate;           // 토비%
    private Double tobiMinus3Rate;     // 토비시3%
    
    // ===== 순위 카운트 (동장 0.5 / 반장 1 가중치) =====
    private Double firstCount;         // 1
    private Double secondCount;        // 2
    private Double thirdCount;         // 3
    private Double fourthCount;        // 4

    // ===== 기타 =====
    private Double avgRank;            // 순위% (평균순위)
    private Double totalCount;         // 국수 (가중 합산)
    // 여기까지가 프론트가 쓰는거임

    // ===== 내부 계산용 (필요하면 유지) =====
    private Double plusCount;
    private Double minus2Count;
    private Double plus3Count;
    private Double tobiCount;
    private Double tobiMinus3Count;

    public RankGetResponse(Long memberId,
                           String memberNickname,
                           Double recordSumPoint,
                           Double totalCount,
                           Double firstCount,
                           Double secondCount,
                           Double thirdCount,
                           Double fourthCount,
                           Double plusCount,
                           Double minus2Count,
                           Double plus3Count,
                           Double tobiCount,
                           Double tobiMinus3Count) {
        
        this.memberId = memberId;
        this.memberNickname = memberNickname;
        this.recordSumPoint = recordSumPoint;
        this.totalCount = totalCount;
        
        this.firstCount = firstCount;
        this.secondCount = secondCount;
        this.thirdCount = thirdCount;
        this.fourthCount = fourthCount;
        
        this.plusCount = plusCount;
        this.minus2Count = minus2Count;
        this.plus3Count = plus3Count;
        
        this.tobiCount = tobiCount;
        this.tobiMinus3Count = tobiMinus3Count;
    }
}
