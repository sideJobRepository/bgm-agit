package com.bgmagitapi.kml.setting.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.setting.dto.request.SettingPostRequest;
import com.bgmagitapi.kml.setting.dto.response.SettingGetResponse;

public interface SettingService {

    
    SettingGetResponse getSettings();
    
    ApiResponse createSettings(SettingPostRequest request);
}
