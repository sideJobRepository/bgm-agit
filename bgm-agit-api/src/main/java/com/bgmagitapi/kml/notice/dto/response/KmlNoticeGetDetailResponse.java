package com.bgmagitapi.kml.notice.dto.response;


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
public class KmlNoticeGetDetailResponse {
    
    private Long id;
    private String title;
    private String cont;
    private LocalDate registDate;
    private List<KmlNoticeFile> files;
    
    
    public List<KmlNoticeFile> getFiles() {
        if (this.files == null) {
            this.files = new ArrayList<>();
        }
        return this.files;
    }
    
    
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class KmlNoticeFile {
        private Long id;
        private String fileName;
        private String fileUrl;
        private String fileFolder;
    }
}
