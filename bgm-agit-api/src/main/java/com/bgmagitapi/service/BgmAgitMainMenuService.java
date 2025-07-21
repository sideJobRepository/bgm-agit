package com.bgmagitapi.service;

import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;
import com.bgmagitapi.entity.BgmAgitMainMenu;

import java.util.List;

public interface BgmAgitMainMenuService {
    
    List<BgmAgitMainMenuResponse> getMainMenu();
}
