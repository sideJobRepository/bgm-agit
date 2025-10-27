package com.bgmagitapi.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BgmAgitFreePostRequest {
    
    @NotNull(message = "로그인을 다시해주세요")
    private Long memberId;
    
    @NotBlank(message = "제목은 필수 입력 입니다.")
    private String title;
    
    @NotBlank(message = "내용은 필수 입력 입니다.")
    private String cont;
    
    List<MultipartFile> files;
    
    public List<MultipartFile> getFiles() {
        if(this.files == null) {
            this.files = new ArrayList<>();
        }
        return this.files;
    }
}
