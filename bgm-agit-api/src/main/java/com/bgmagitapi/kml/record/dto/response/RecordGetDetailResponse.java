package com.bgmagitapi.kml.record.dto.response;


import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.record.enums.Wind;
import com.querydsl.core.annotations.QueryProjection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordGetDetailResponse {
    
    private Long matchsId;
    private String tournamentStatus;
    // 대회 기록일 때만 채워짐 — 대회 setting의 단일 turning (× 4 안 함, 프론트가 합계 계산 시 곱함)
    private Integer tournamentTurning;
    private String tournamentName;
    private MatchsWind wind;
    private List<RecordList> records;
    private List<YakumanList> yakumans;
    
    @Data
    @NoArgsConstructor
    @Builder
    public static class RecordList {
        private Long recordId;
        private Long memberId;
        private String nickName;
        private Integer recordScore;
        private Wind recordSeat;
        
        @QueryProjection
        public RecordList(Long recordId, Long memberId, String nickName, Integer recordScore, Wind recordSeat) {
            this.recordId = recordId;
            this.memberId = memberId;
            this.nickName = nickName;
            this.recordScore = recordScore;
            this.recordSeat = recordSeat;
        }
    }
    
    
    @Data
    @NoArgsConstructor
    public static class YakumanList{
        private Long yakumanId;
        private Long memberId;
        private String nickName;
        private String yakumanName;
        private String yakumanCont;
        // legacy: BgmAgitCommonFile 의 풀 URL (구버전 데이터용)
        private String imageUrl;
        // new: BgmAgitFile 의 ID. 프론트가 /file-view 로 presigned URL 조회
        private Long fileId;

        @QueryProjection
        public YakumanList(Long yakumanId, Long memberId, String nickName, String yakumanName, String yakumanCont, String imageUrl, Long fileId) {
            this.yakumanId = yakumanId;
            this.memberId = memberId;
            this.nickName = nickName;
            this.yakumanName = yakumanName;
            this.yakumanCont = yakumanCont;
            this.imageUrl = imageUrl;
            this.fileId = fileId;
        }
    }
}
