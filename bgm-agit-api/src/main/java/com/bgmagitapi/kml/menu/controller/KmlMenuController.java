package com.bgmagitapi.kml.menu.controller;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.kml.menu.dto.request.KmlMenuPostRequest;
import com.bgmagitapi.kml.menu.dto.response.KmlMenuCreateOptionsResponse;
import com.bgmagitapi.kml.menu.dto.response.KmlMenuGetResponse;
import com.bgmagitapi.kml.menu.service.KmlMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
@RestController
public class KmlMenuController {

    private final KmlMenuService kmlMenuService;
    
    @GetMapping("/kml-menu")
    public List<KmlMenuGetResponse> kmlMenu() {
        return kmlMenuService.findByKmlMenu();
    }

    @GetMapping("/menu-create/options")
    public KmlMenuCreateOptionsResponse menuCreateOptions() {
        return kmlMenuService.getMenuCreateOptions();
    }

    @PostMapping("/menu-create")
    public ApiResponse createMenu(@Validated @RequestBody KmlMenuPostRequest request) {
        return kmlMenuService.createMenu(request);
    }

    @PutMapping("/menu-create/{menuId}")
    public ApiResponse updateMenu(
            @PathVariable Long menuId,
            @Validated @RequestBody KmlMenuPostRequest request
    ) {
        return kmlMenuService.updateMenu(menuId, request);
    }

    @DeleteMapping("/menu-create/{menuId}")
    public ApiResponse deleteMenu(@PathVariable Long menuId) {
        return kmlMenuService.deleteMenu(menuId);
    }
}
