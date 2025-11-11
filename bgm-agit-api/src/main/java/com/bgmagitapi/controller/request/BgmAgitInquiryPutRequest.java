package com.bgmagitapi.controller.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BgmAgitInquiryPutRequest {

    private Long id;
    
    private String title;
    
    private String cont;
    
    private List<Long> deletedFiles;
    
    private List<MultipartFile> files;
    
    public List<Long> getDeletedFiles() {
        if(deletedFiles == null) {
            deletedFiles = new ArrayList<>();
        }
        return this.deletedFiles;
    }
    
    public List<MultipartFile> getFiles() {
        if(this.files == null) {
            this.files = new ArrayList<>();
        }
        return this.files;
    }
}
