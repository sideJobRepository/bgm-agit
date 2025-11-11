package com.bgmagitapi.controller.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BgmAgitInquiryGetDetailResponse {
    
    private String id;
    private String memberId;
    private String title;
    private String cont;
    private String answerStatus;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDateTime registDate;
    private List<Files> files; // 부모 문의글 첨부파일 리스트
    private Reply reply; //  답글 정보 포함
  
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Reply {
        private String id;
        private String memberId;
        private String title;
        private String cont;
        private String answerStatus;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDateTime registDate;
        private List<Files> files;
    }
        @Data
       @NoArgsConstructor
       @AllArgsConstructor
       @Builder
       public static class Files {
           private Long id;
           private String fileName;
           private String fileUrl;
           private String uuid;
       }
}
