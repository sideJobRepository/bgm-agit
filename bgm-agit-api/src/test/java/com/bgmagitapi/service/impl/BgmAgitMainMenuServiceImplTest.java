package com.bgmagitapi.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;
import com.bgmagitapi.service.BgmAgitMainMenuService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

class BgmAgitMainMenuServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private BgmAgitMainMenuService bgmAgitMainMenuService;
    
    @DisplayName("")
    @Test
    void test(){
        List<BgmAgitMainMenuResponse> mainMenu = bgmAgitMainMenuService.getMainMenu();
        
        System.out.println("mainMenu = " + mainMenu);
        
    }

}