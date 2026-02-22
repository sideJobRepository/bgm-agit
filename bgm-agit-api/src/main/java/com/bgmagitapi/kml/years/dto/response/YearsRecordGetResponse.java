package com.bgmagitapi.kml.years.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class YearsRecordGetResponse {
    
    
    private Integer year;
    // page meta
    private int pageNumber;       // 0-base
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
    
    private List<MatchRecord> content;
    

    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    public static class MatchRecord {
        
        private Long matchsId;
        private String wind;
        
        private String first;
        private String second;
        private String third;
        private String fourth;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING,
                pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime registDate;
    }
}
