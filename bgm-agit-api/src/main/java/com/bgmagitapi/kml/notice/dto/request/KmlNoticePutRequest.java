package com.bgmagitapi.kml.notice.dto.request;

import com.bgmagitapi.kml.notice.dto.enums.FileStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    
    @NotNull(message = "공지사항 id는 필수입니다.")
    private Long id;
    @NotBlank(message = "제목은 필수입니다.")
    private String title;
    @NotBlank(message = "내용은 필수입니다.")
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
