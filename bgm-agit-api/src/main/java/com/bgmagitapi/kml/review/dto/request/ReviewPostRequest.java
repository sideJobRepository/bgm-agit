package com.bgmagitapi.kml.review.dto.request;

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
public class ReviewPostRequest {
    
    
    @NotNull(message = "다시 로그인 해주세요")
    private Long memberId;
    @NotBlank(message = "제목을 입력해주세요")
    private String title;
    @NotBlank(message = "내용을입력해주세요")
    private String cont;
    
    private List<MultipartFile> files;
    
    public List<MultipartFile> getFiles() {
        if (this.files == null) {
            this.files = new ArrayList<>();
        }
        return this.files;
    }
}
