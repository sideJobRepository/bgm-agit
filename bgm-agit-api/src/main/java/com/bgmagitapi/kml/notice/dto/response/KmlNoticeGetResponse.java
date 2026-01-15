package com.bgmagitapi.kml.notice.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class KmlNoticeGetResponse {
    
    private Long id;
    private String title;
    private String cont;
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
        private String id;
        private String fileName;
        private String fileUrl;
    }
}
