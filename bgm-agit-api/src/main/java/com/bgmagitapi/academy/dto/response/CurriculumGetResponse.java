package com.bgmagitapi.academy.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@Builder
public class CurriculumGetResponse {
    
    private Integer year;
    private String className;
    private String title;
    private List<Row> rows;
    
    @QueryProjection
    public CurriculumGetResponse(Integer year, String className, String title, List<Row> rows) {
        this.year = year;
        this.className = className;
        this.title = title;
        this.rows = rows;
    }
    
    public List<Row> getRows() {
        if (this.rows == null) {
            this.rows = new ArrayList<>();
        }
        return this.rows;
    }
    
    @Data
    @NoArgsConstructor
    @Builder
    public static class Row {
        private String progressType;
        private List<MonthContent> months;
        
        @QueryProjection
        public Row(String progressType, List<MonthContent> months) {
            this.progressType = progressType;
            this.months = months;
        }
        
        public List<MonthContent> getMonths() {
            if (this.months == null) {
                this.months = new ArrayList<>();
            }
            return this.months;
        }
    }
    
    
    @Data
    @NoArgsConstructor
    @Builder
    public static class MonthContent {
        private Integer startMonth;   // 1~12
        private Integer endMonth;     // 1~12
        private String content;     // 내용
        
        @QueryProjection
        public MonthContent(Integer startMonth, Integer endMonth, String content) {
            this.startMonth = startMonth;
            this.endMonth = endMonth;
            this.content = content;
        }
    }
}
