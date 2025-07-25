package com.bgmagitapi.controller;

import com.bgmagitapi.service.BgmAgitNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitNoticeController {
    
    private final BgmAgitNoticeService bgmAgitNoticeService;
    
    @GetMapping("/notice")
    public String getNotice() {
        return null;
    }
    
    @PostMapping("/notice")
    public String createNotice(@AuthenticationPrincipal Jwt jwt) {
        Object id = jwt.getClaim("id");
        System.out.println("jwt = " + jwt);
        return null;
    }
    
    
    @PutMapping("/notice")
    public String modifyNotice() {
        return null;
    }
    
    
    @DeleteMapping("/notice")
    public String deleteNotice() {
        return null;
    }
}
