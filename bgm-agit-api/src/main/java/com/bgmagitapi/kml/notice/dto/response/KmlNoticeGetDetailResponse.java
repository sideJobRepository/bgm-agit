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
        // legacy 면 BgmAgitCommonFile.id, 아니면 BgmAgitFile.id
        private Long id;
        private String fileName;
        // legacy 면 풀 URL, 아니면 null (프론트가 /file-view 로 presigned URL 조회)
        private String fileUrl;
        private String fileFolder;
        // true: 옛 BgmAgitCommonFile / false: 새 BgmAgitFile
        private boolean legacy;
    }
}
