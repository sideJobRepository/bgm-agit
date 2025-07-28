package com.bgmagitapi.config;

import lombok.Getter;

@Getter
public class UploadResult {
    
    
    
    private final String url;
    private final String uuid;
    
    public UploadResult(String url, String uuid) {
        this.url = url;
        this.uuid = uuid;
    }
    
}
