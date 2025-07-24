package com.bgmagitapi.service;

import com.bgmagitapi.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;

import java.util.List;
import java.util.Map;

public interface BgmAgitMainMenuService {
    
    List<BgmAgitMainMenuResponse> getMainMenu();
    
    Map<Long, List<BgmAgitMainMenuImageResponse>> getMainMenuImage(Long labelGb , String link);
}
