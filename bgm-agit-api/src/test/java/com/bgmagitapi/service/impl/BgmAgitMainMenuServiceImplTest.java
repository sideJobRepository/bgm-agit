package com.bgmagitapi.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.service.BgmAgitMainMenuService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;

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
        Map<Long, List<BgmAgitMainMenuImageResponse>> mainMenuImage
                = bgmAgitMainMenuService.getMainMenuImage(2L,"/detail/game");
        
        System.out.println("mainMenuImage = " + mainMenuImage);
    }
    
    @DisplayName("")
    @Test
    void test3(){
        String link = "/detail/food";
        String category = "MURDER";
        PageRequest pageRequest = PageRequest.of(0, 10);
        PageResponse<BgmAgitMainMenuImageResponse> result = bgmAgitMainMenuService.getImagePage(4L, link, pageRequest, null, null);
        
        System.out.println("result = " + result);
        
        
    }

}