package com.bgmagitapi.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitFreePutRequest {
    
    @NotNull(message = "자유 게시판 ID가 존재하지않습니다.")
    private Long id;
    
    private Long memberId;
    
    @NotBlank(message = "제목은 필수 입력 입니다.")
    private String title;
    
    @NotBlank(message = "내용은 필수 입력 입니다.")
    private String content;
    
    private List<String> deletedFiles;
    
    private List<MultipartFile> files;
    
}
