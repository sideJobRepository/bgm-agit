package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitDeleteRequest;
import com.bgmagitapi.controller.request.BgmAgitNoticeCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitNoticeModifyRequest;
import com.bgmagitapi.controller.response.notice.BgmAgitNoticeResponse;
import com.bgmagitapi.service.BgmAgitNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitNoticeController {
    
    private final BgmAgitNoticeService bgmAgitNoticeService;
    
    @GetMapping("/notice")
    public Page<BgmAgitNoticeResponse> getNotice(@PageableDefault(size = 10, sort = "bgmAgitNoticeId", direction = Sort.Direction.DESC) Pageable pageable) {
        return bgmAgitNoticeService.getNotice(pageable);
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
