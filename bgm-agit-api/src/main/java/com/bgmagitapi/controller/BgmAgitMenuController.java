package com.bgmagitapi.controller;


import com.bgmagitapi.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;
import com.bgmagitapi.service.BgmAgitMainMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitMenuController {
    
    private final BgmAgitMainMenuService bgmAgitMainMenuService;
    
    @GetMapping(value = "/main-menu")
    public List<BgmAgitMainMenuResponse> getMenu() {
        return bgmAgitMainMenuService.getMainMenu();
    }
    
    @GetMapping(value = "/main-image")
    public Map<Long, List<BgmAgitMainMenuImageResponse>> getMenuImage(
            @RequestParam(name = "labelGb", required = false) Long labelGb,
            @RequestParam(name = "link", required = false) String link) {
        return bgmAgitMainMenuService.getMainMenuImage(labelGb, link);
    }
    @GetMapping(value = "/detail")
    public Map<String, Object> getDetail(
            @RequestParam(name = "labelGb",required = false) Long labelGb,
            @RequestParam(name = "link",required = false) String link,
            @RequestParam(name = "category",required = false) String category,
            @RequestParam(name = "name",required = false) String name,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        if (StringUtils.hasText(name)) {
           name =  URLDecoder.decode(name, StandardCharsets.UTF_8);
        }
        return bgmAgitMainMenuService.getImagePage(labelGb, link, pageable, category, name);
    }
}
