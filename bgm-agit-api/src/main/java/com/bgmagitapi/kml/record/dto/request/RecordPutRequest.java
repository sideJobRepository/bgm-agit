package com.bgmagitapi.kml.record.dto.request;

//{
//  "wind": "SOUTH",
//  "tournamentStatus" : "N",
//  "records": [
//    {
//      "memberId": 1,
//      "recordScore": 60000,
//      "recordSeat": "EAST"
//    },
//    {
//      "memberId": 2,
//      "recordScore": -10000,
//      "recordSeat": "SOUTH"
//    },
//    {
//      "memberId": 3,
//      "recordScore": -20000,
//      "recordSeat": "WEST"
//    },
//    {
//      "memberId": 4,
//      "recordScore": -30000,
//      "recordSeat": "NORTH"
//    }
//  ],
//  "yakuman" : [
//    {
//      "memberId" : 1,
//      "yakumanName" : "구련보등",
//      "yakumanCont" : "동1국 진하친 구련보등 쯔모"
//    }
//  ]
//}


import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.record.enums.Wind;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecordPutRequest {

    private Long matchsId;
    
    private MatchsWind wind;
    
    private String tournamentStatus;
    
    @NotBlank(message = "수정 사유를 입력해주세요")
    private String changeReason;
    
    @Valid
    private List<Records> records;
    @Valid
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
        private Long recordId;
        private Long memberId;
        private Integer recordScore;
        private Integer recordRank;
        private Wind recordSeat;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Yakumans {
        private Long yakumanId;
        private Long memberId;
        private String yakumanName;
        @NotBlank(message = "내용을 입력해주세요")
        private String yakumanCont;
        private MultipartFile files;
        
    }
}
