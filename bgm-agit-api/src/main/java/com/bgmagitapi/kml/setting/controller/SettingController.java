package com.bgmagitapi.kml.setting.controller;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.setting.dto.request.SettingPostRequest;
import com.bgmagitapi.kml.setting.dto.response.SettingGetResponse;
import com.bgmagitapi.kml.setting.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bgm-agit")
@RequiredArgsConstructor
public class SettingController {


    private final SettingService settingService;
    
    
    @GetMapping("/settings")
    public SettingGetResponse getSettings() {
        return settingService.getSettings();
    }
    
    @GetMapping("/settings/refund")
    public Integer getRefund() {
        return settingService.getRefund();
    }
    
    @PostMapping("/settings")
    public ApiResponse setSettings(@Validated @RequestBody SettingPostRequest request) {
        return settingService.createSettings(request);
    }
}
