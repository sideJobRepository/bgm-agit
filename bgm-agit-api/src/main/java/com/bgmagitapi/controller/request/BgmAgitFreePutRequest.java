package com.bgmagitapi.controller.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitFreePutRequest {
    
    private Long id;
    
    private Long memberId;
    
    private String title;
    
    private String content;
    
    private List<String> deletedFiles;
    
    private List<MultipartFile> files;
    
}
