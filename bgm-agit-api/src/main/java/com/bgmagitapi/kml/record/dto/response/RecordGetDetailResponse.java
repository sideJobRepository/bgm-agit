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
        private String imageUrl;
        
        @QueryProjection
        public YakumanList(Long yakumanId, Long memberId, String nickName, String yakumanName, String yakumanCont, String imageUrl) {
            this.yakumanId = yakumanId;
            this.memberId = memberId;
            this.nickName = nickName;
            this.yakumanName = yakumanName;
            this.yakumanCont = yakumanCont;
            this.imageUrl = imageUrl;
        }
    }
}
