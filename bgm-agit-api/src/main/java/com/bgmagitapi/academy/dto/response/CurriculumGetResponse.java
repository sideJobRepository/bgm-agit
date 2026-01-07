package com.bgmagitapi.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class CurriculumGetResponse {
    
    /*  {
        "id" : 1
        "year": 2026,
        "className": "3G",
        "title": "커리큘럼 12월 예시",
        "rows": [
          {
            "id" : 1
            "progressType": "국어",
            "ranges": [
              { id: 1 , "startMonth": 1, "endMonth": 3, "content": "받아쓰기" },
              { id: 2 , "startMonth": 4, "endMonth": 4, "content": "문장 쓰기" },
              { id: 3 , "startMonth": 5, "endMonth": 6, "content": "동화 읽기" }
              { id: 4 , "startMonth": 7, "endMonth": 7, "content": "문장 읽기" }
            ]
          },
          {
            "id" : 2
            "progressType": "수학",
            "ranges": [
              { id:5, "startMonth": 1, "endMonth": 2, "content": "덧셈" },
              { id:6, "startMonth": 3, "endMonth": 5, "content": "뺄셈" }
              { id:7, "startMonth": 6, "endMonth": 6, "content": "곱하기" }
            ]
          }
        ]
      } */
    
    private Long id;
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
    @NoArgsConstructor
    @Builder
    @AllArgsConstructor
    public static class Row {
        private Long id;
        private String progressType;
        private List<MonthContent> months;
        

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
    @AllArgsConstructor
    public static class MonthContent {
        private Long id;
        private Integer startMonth;   // 1~12
        private Integer endMonth;     // 1~12
        private String content;     // 내용
    }
}
