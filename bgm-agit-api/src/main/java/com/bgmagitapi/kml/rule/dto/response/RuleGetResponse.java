package com.bgmagitapi.kml.rule.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RuleGetResponse {
    
    private Long id;
    private String tournamentStatus;
    private RuleFileResponse file;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RuleFileResponse {
        private Long id;
        private String fileName;
        private String fileUrl;
        private String fileFolder;
    }
}
