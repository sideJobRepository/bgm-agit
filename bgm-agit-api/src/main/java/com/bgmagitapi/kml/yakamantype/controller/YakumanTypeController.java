package com.bgmagitapi.kml.yakamantype.controller;


import com.bgmagitapi.kml.yakamantype.dto.response.MembersGetResponse;
import com.bgmagitapi.kml.yakamantype.dto.response.SettingGetResponse;
import com.bgmagitapi.kml.yakamantype.dto.response.YakumanTypeGetResponse;
import com.bgmagitapi.kml.yakamantype.service.YakumanTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
@RestController
public class YakumanTypeController {
    
    
    private final YakumanTypeService yakumanTypeService;
    
    
    @GetMapping("/yakumanType")
    public List<YakumanTypeGetResponse> getYakumanType() {
        return yakumanTypeService.getYakumanType();
    }
    
    @GetMapping("/mahjong-members")
    public List<MembersGetResponse> getMembers() {
        return yakumanTypeService.getNickName();
    }
    
    @GetMapping("/setting")
    public SettingGetResponse getSetting() {
        return yakumanTypeService.getSetting();
    }
    
}
