package com.bgmagitapi.academy.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CurriculumPostRequest {
  
  /*  {
      "year": 2026,
      "className": "3G",
      "title": "커리큘럼 12월 예시",
    
      "rows": [
        {
          "progressType": "국어",
          "ranges": [
            { "startMonth": 1, "endMonth": 3, "content": "받아쓰기" },
            { "startMonth": 4, "endMonth": 4, "content": "문장 쓰기" },
            { "startMonth": 5, "endMonth": 6, "content": "동화 읽기" }
            { "startMonth": 7, "endMonth": 7, "content": "문장 읽기" }
          ]
        },
        {
          "progressType": "수학",
   
          "ranges": [
            { "startMonth": 1, "endMonth": 2, "content": "덧셈" },
            { "startMonth": 3, "endMonth": 5, "content": "뺄셈" }
            { "startMonth": 6, "endMonth": 6, "content": "곱하기" }
          ]
        }
      ]
    } */
    
    private Integer year;
    private String className;
    private String title;
    private List<Row> rows;
    
    
    public List<Row> getRows() {
        if (this.rows == null) {
            this.rows = new ArrayList<>();
        }
        return this.rows;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Row {
        private String progressType;
        private List<MonthContent> months;
        
        public List<MonthContent> getMonths() {
            if(this.months == null) {
                this.months = new ArrayList<>();
            }
            return this.months;
        }
    }
    
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class MonthContent {
        private Integer startMonth;   // 1~12
        private Integer endMonth;     // 1~12
        private String content;     // 내용
    }
}
