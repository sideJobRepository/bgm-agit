package com.bgmagitapi.kml.record.dto.response;

import com.bgmagitapi.kml.record.enums.Wind;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordGetResponse {
    

    private Long matchsId;
    private LocalDateTime registDate;
    private String createNicname;
    private List<Row> rows;
    
    public List<Row> getRows() {
        if(this.rows == null) {
            this.rows = new ArrayList<>();
        }
        return this.rows;
    }
    
    @Data
    public static class Row {
        private Wind seat;      // 東 / 南 / 西 / 北
        private Integer rank;
        private String nickname;
        private Integer score;
        private Double point;
        private boolean winner;   // 1등 강조용
    }
}
