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
        private Integer recordScore;
        private String nickName;
        private Wind recordSeat;
        
        @QueryProjection
        public RecordList(Long recordId, Integer recordScore, String nickName, Wind recordSeat) {
            this.recordId = recordId;
            this.recordScore = recordScore;
            this.nickName = nickName;
            this.recordSeat = recordSeat;
        }
    }
    
    
    @Data
    @NoArgsConstructor
    public static class YakumanList{
        private Long yakumanId;
        private String yakumanName;
        private String yakumanCont;
        private String imageUrl;
        
        @QueryProjection
        public YakumanList(Long yakumanId, String yakumanName, String yakumanCont, String imageUrl) {
            this.yakumanId = yakumanId;
            this.yakumanName = yakumanName;
            this.yakumanCont = yakumanCont;
            this.imageUrl = imageUrl;
        }
    }
}
