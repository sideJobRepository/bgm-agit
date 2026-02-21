package com.bgmagitapi.kml.yakamantype.service;

import com.bgmagitapi.kml.yakamantype.dto.response.MembersGetResponse;
import com.bgmagitapi.kml.yakamantype.dto.response.SettingGetResponse;
import com.bgmagitapi.kml.yakamantype.dto.response.YakumanTypeGetResponse;

import java.util.List;

public interface YakumanTypeService {

    
    List<YakumanTypeGetResponse> getYakumanType();
    
    List<MembersGetResponse> getNickName();
    
    SettingGetResponse getSetting();
    
}
