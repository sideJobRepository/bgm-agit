package com.bgmagitapi.kml.setting.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.setting.dto.request.SettingPostRequest;
import com.bgmagitapi.kml.setting.dto.response.SettingGetResponse;
import com.bgmagitapi.kml.setting.entity.Setting;
import com.bgmagitapi.kml.setting.repository.SettingRepository;
import com.bgmagitapi.kml.setting.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
@RequiredArgsConstructor
public class SettingServiceImpl implements SettingService {
    
    private final SettingRepository settingRepository;
    
    @Override
    @Transactional(readOnly = true)
    public SettingGetResponse getSettings() {
        Setting findSetting = settingRepository.findBySetting();
        return SettingGetResponse
                .builder()
                .turning(findSetting.getTurning())
                .firstUma(findSetting.getFirstUma())
                .secondUma(findSetting.getSecondUma())
                .thirdUma(findSetting.getThirdUma())
                .fourthUma(findSetting.getFourUma())
                .build();
    }
    
    @Override
    public ApiResponse createSettings(SettingPostRequest request) {
        settingRepository.updateUseStatusN();
        Setting setting = Setting
                .builder()
                .turning(request.getTurning())
                .firstUma(request.getFirstUma())
                .secondUma(request.getSecondUma())
                .thirdUma(request.getThirdUma())
                .fourUma(request.getFourthUma())
                .useStatus("Y")
                .build();
        settingRepository.save(setting);
        return new ApiResponse(200,true,"반환점 설정이 완료되었습니다.");
    }
}
