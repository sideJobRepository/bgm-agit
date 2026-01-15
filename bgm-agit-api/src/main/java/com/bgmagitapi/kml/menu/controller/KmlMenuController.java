package com.bgmagitapi.kml.menu.controller;

import com.bgmagitapi.kml.menu.dto.response.KmlMenuGetResponse;
import com.bgmagitapi.kml.menu.service.KmlMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
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
}
