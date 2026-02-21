package com.bgmagitapi.kml.yakamantype.repository.query;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.kml.setting.entity.Setting;

import java.util.List;

public interface YakumanTypeQueryRepository {

    List<BgmAgitMember> getMembers();
    
    Setting getSetting();
}
