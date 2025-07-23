package com.bgmagitapi.service;

import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;

import java.util.List;

public interface BgmAgitMainMenuService {
    
    List<BgmAgitMainMenuResponse> getMainMenu();
}
