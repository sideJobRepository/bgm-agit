package com.bgmagitapi.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;
import com.bgmagitapi.service.BgmAgitMainMenuService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

class BgmAgitMainMenuServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private BgmAgitMainMenuService bgmAgitMainMenuService;
    
    @DisplayName("")
    @Test
    void test1(){
        List<BgmAgitMainMenuResponse> mainMenu = bgmAgitMainMenuService.getMainMenu();
        
        System.out.println("mainMenu = " + mainMenu);
        
    }
    
    @DisplayName("")
    @Test
    void test2(){
        Map<Long, List<BgmAgitMainMenuImageResponse>> mainMenuImage = bgmAgitMainMenuService.getMainMenuImage();
        
        System.out.println("mainMenuImage = " + mainMenuImage);
    }

}