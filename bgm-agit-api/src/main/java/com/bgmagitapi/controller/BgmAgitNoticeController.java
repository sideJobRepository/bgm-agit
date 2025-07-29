package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
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

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitNoticeController {
    
    private final BgmAgitNoticeService bgmAgitNoticeService;
    
    @GetMapping("/notice")
    public Page<BgmAgitNoticeResponse> getNotice(@PageableDefault(size = 10, sort = "bgmAgitNoticeId", direction = Sort.Direction.DESC) Pageable pageable,
                                                 @RequestParam(name = "titleOrCont" , required = false) String titleOrCont
                                                 ) {
        
        return bgmAgitNoticeService.getNotice(pageable,titleOrCont);
    }
    @PostMapping("/notice")
    public ApiResponse createNotice(@ModelAttribute BgmAgitNoticeCreateRequest request) {
        return bgmAgitNoticeService.createNotice(request);
    }
    
    
    @PutMapping("/notice")
    public ApiResponse modifyNotice(@ModelAttribute BgmAgitNoticeModifyRequest request) {
        return bgmAgitNoticeService.modifyNotice(request);
    }
    
    
    @DeleteMapping("/notice/{id}")
    public ApiResponse deleteNotice(@PathVariable Long id) {
        return bgmAgitNoticeService.deleteNotice(id);
    }
}
