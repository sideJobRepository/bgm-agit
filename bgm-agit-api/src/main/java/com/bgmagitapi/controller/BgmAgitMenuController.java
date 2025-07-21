package com.bgmagitapi.controller;


import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;
import com.bgmagitapi.service.BgmAgitMainMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitMenuController {
    
    private final BgmAgitMainMenuService bgmAgitMainMenuService;
    
    @GetMapping("/main-menu")
    public List<BgmAgitMainMenuResponse> menu() {
        return  bgmAgitMainMenuService.getMainMenu();
    }
}
