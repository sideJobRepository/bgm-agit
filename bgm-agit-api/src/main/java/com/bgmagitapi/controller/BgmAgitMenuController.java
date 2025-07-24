package com.bgmagitapi.controller;


import com.bgmagitapi.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;
import com.bgmagitapi.service.BgmAgitMainMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitMenuController {
    
    private final BgmAgitMainMenuService bgmAgitMainMenuService;
    
    @GetMapping("/main-menu")
    public List<BgmAgitMainMenuResponse> getMenu() {
        return  bgmAgitMainMenuService.getMainMenu();
    }
    
    @GetMapping("/main-image")
    public Map<Long, List<BgmAgitMainMenuImageResponse>> getMenuImage(
            @RequestParam(name = "labelGb",required = false) Long labelGb,
            @RequestParam(name = "link",required = false) String link) {
        return  bgmAgitMainMenuService.getMainMenuImage(labelGb,link);
    }
}
