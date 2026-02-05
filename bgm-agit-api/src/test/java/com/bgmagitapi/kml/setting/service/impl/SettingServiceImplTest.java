package com.bgmagitapi.kml.setting.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.setting.dto.request.SettingPostRequest;
import com.bgmagitapi.kml.setting.dto.response.SettingGetResponse;
import com.bgmagitapi.kml.setting.service.SettingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class SettingServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private SettingService settingService;
    
    @DisplayName("")
    @Test
    void test1(){
        SettingPostRequest request = SettingPostRequest
                .builder()
                .turning(24000)
                .firstUma(10)
                .secondUma(5)
                .thirdUma(-5)
                .fourthUma(-10)
                .build();
        
        ApiResponse settings = settingService.createSettings(request);
        System.out.println("settings = " + settings);
    }
    
    @DisplayName("")
    @Test
    void test2(){
        SettingGetResponse settings = settingService.getSettings();
        System.out.println("settings = " + settings);
    }
    
}