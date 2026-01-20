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
    
    private List<Long> deleteFileIds;
    
    private List<MultipartFile> files;
    
    public List<Long> getDeleteFileIds() {
        if (this.deleteFileIds == null) {
            this.deleteFileIds = new ArrayList<>();
        }
        return this.deleteFileIds;
    }
    
    public List<MultipartFile> getFiles() {
        if (this.files == null) {
            this.files = new ArrayList<>();
        }
        return this.files;
    }
}
