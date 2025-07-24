package com.bgmagitapi.controller;

import com.bgmagitapi.service.BgmAgitNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
    public String createNotice() {
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
