package com.bgmagitapi.controller.request;

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
    
    private Long memberId;
    
    private String title;
    
    private String cont;
    
    List<MultipartFile> files;
    
    public List<MultipartFile> getFiles() {
        if(this.files == null) {
            this.files = new ArrayList<>();
        }
        return this.files;
    }
}
