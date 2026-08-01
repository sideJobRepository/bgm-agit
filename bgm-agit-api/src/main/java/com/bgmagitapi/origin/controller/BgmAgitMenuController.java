package com.bgmagitapi.origin.controller;


import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitMainMenuPostRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitMainMenuCreateOptionsResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitMainMenuResponse;
import com.bgmagitapi.origin.service.BgmAgitMainMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    // =========================== 관리자 메뉴 관리 ===========================

    @GetMapping("/main-menu/options")
    public BgmAgitMainMenuCreateOptionsResponse menuCreateOptions() {
        return bgmAgitMainMenuService.getMenuCreateOptions();
    }

    @PostMapping("/main-menu")
    public ApiResponse createMenu(@Validated @RequestBody BgmAgitMainMenuPostRequest request) {
        return bgmAgitMainMenuService.createMenu(request);
    }

    @PutMapping("/main-menu/{menuId}")
    public ApiResponse updateMenu(@PathVariable Long menuId,
                                  @Validated @RequestBody BgmAgitMainMenuPostRequest request) {
        return bgmAgitMainMenuService.updateMenu(menuId, request);
    }

    @DeleteMapping("/main-menu/{menuId}")
    public ApiResponse deleteMenu(@PathVariable Long menuId) {
        return bgmAgitMainMenuService.deleteMenu(menuId);
    }
}
