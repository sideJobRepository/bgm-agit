package com.bgmagitapi.kml.record.dto.request;

//{
//  "wind": "SOUTH",
//  "tournamentStatus" : "N",
//  "records": [
//    {
//      "memberId": 1,
//      "recordRank": 1,
//      "recordScore": 60000,
//      "recordSeat": "EAST"
//    },
//    {
//      "memberId": 2,
//      "recordRank": 2,
//      "recordScore": -10000,
//      "recordSeat": "SOUTH"
//    },
//    {
//      "memberId": 3,
//      "recordRank": 3,
//      "recordScore": -20000,
//      "recordSeat": "WEST"
//    },
//    {
//      "memberId": 4,
//      "recordRank": 4,
//      "recordScore": -30000,
//      "recordSeat": "NORTH"
//    }
//  ],
//  "yakuman" : [
//    {
//      "memberId" : 1,
//      "yakumanName" : "구련보등"
//    }
//  ]
//}

import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.record.enums.Wind;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecordPostRequest {

    private MatchsWind wind;
    
    private String tournamentStatus;
    
    private List<Records> records;
    
    private List<Yakumans> yakumans;
    
    public List<Records> getRecords() {
        if(this.records == null) {
            this.records = new ArrayList<>();
        }
        return this.records;
    }
    
    public List<Yakumans> getYakumans() {
        if(this.yakumans == null) {
            this.yakumans = new ArrayList<>();
        }
        return this.yakumans;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Records {
        private Long memberId;
        private Integer recordRank;
        private Integer recordScore;
        private Wind recordSeat;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Yakumans {
        private Long memberId;
        private String yakumanName;
    }
}
