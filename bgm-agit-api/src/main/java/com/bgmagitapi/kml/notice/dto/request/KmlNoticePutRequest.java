package com.bgmagitapi.kml.notice.dto.request;

import com.bgmagitapi.kml.notice.dto.enums.FileStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class KmlNoticePutRequest {
    
    private Long id;
    
    private String title;
    
    private String cont;
    
    private List<KmlNoticeFilePutRequest> existingFiles;
    
    private List<MultipartFile> files;
    
    public List<KmlNoticeFilePutRequest> getExistingFiles() {
        if(existingFiles == null) {
            existingFiles = new ArrayList<>();
        }
        return existingFiles;
    }
    
    public List<MultipartFile> getFiles() {
        if(files == null) {
            files = new ArrayList<>();
        }
        return files;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class KmlNoticeFilePutRequest {
        private Long id;
        private String fileName;
        private String fileUrl;
        private FileStatus status;
    }
}
