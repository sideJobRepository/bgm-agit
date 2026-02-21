package com.bgmagitapi.kml.history.dto;

import com.bgmagitapi.kml.history.enums.ChangeType;
import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.record.enums.Wind;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.querydsl.core.annotations.QueryProjection;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Data
@NoArgsConstructor
@Builder
public class MatchsAndRecordHistoryResponse {
    
    private Long matchHistoryId;
    private Long matchId;
    
    private Integer turning;
    private Integer firstUma;
    private Integer secondUma;
    private Integer thirdUma;
    private Integer fourthUma;
    
    private MatchsWind matchsWind;
    
    private String tournamentStatus;
    
    private String delStatus;
    
    private ChangeType changeType;
    
    private String changeReason;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime modifyDate;
    
    private String modifyName;
    
    private List<RecordHistList> recordHistory;
    
    public List<RecordHistList> getRecordHistory() {
        if(this.recordHistory == null) {
            this.recordHistory = new ArrayList<>();
        }
        return this.recordHistory;
    }
    
    @QueryProjection
    public MatchsAndRecordHistoryResponse(Long matchHistoryId, Long matchId, Integer turning, Integer firstUma, Integer secondUma, Integer thirdUma, Integer fourthUma, MatchsWind matchsWind, String tournamentStatus, String delStatus, ChangeType changeType, String changeReason, LocalDateTime modifyDate, String modifyName, List<RecordHistList> recordHistory) {
        this.matchHistoryId = matchHistoryId;
        this.matchId = matchId;
        this.turning = turning;
        this.firstUma = firstUma;
        this.secondUma = secondUma;
        this.thirdUma = thirdUma;
        this.fourthUma = fourthUma;
        this.matchsWind = matchsWind;
        this.tournamentStatus = tournamentStatus;
        this.delStatus = delStatus;
        this.changeType = changeType;
        this.changeReason = changeReason;
        this.modifyDate = modifyDate;
        this.modifyName = modifyName;
        this.recordHistory = recordHistory;
    }
    
    @Data
    @NoArgsConstructor
    @Builder
    public static class RecordHistList {
        private Long recordId;
        private String nickName;
        private Integer score;
        private Integer rank;
        private Double point;
        private Wind seat;
        private Boolean winner;
        
        @QueryProjection
        public RecordHistList(Long recordId, String nickName, Integer score, Integer rank, Double point, Wind seat, Boolean winner) {
            this.recordId = recordId;
            this.nickName = nickName;
            this.score = score;
            this.rank = rank;
            this.point = point;
            this.seat = seat;
            this.winner = winner;
        }
    }
    
}
