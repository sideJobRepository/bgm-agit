package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitDeleteRequest;
import com.bgmagitapi.controller.request.BgmAgitNoticeCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitNoticeModifyRequest;
import com.bgmagitapi.controller.response.notice.BgmAgitNoticeResponse;
import com.bgmagitapi.service.BgmAgitNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitNoticeController {
    
    private final BgmAgitNoticeService bgmAgitNoticeService;
    
    @GetMapping("/notice")
    public List<BgmAgitNoticeResponse> getNotice() {
        return bgmAgitNoticeService.getNotice();
    }
    
    @PostMapping("/notice")
    public ApiResponse createNotice(@RequestBody BgmAgitNoticeCreateRequest request) {
        return bgmAgitNoticeService.createNotice(request);
    }
    
    
    @PutMapping("/notice")
    public ApiResponse modifyNotice(@RequestBody BgmAgitNoticeModifyRequest request) {
        return bgmAgitNoticeService.modifyNotice(request);
    }
    
    
    @DeleteMapping("/notice")
    public ApiResponse deleteNotice(@RequestBody BgmAgitDeleteRequest request) {
        return bgmAgitNoticeService.deleteNotice(request.getBgmAgitNoticeId());
    }
}
