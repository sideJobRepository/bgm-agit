package com.bgmagitapi.kml.notice.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePostRequest;
import com.bgmagitapi.kml.notice.service.KmlNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
@RestController
public class KmlNoticeController {
    
    private final KmlNoticeService kmlNoticeService;
    
    
    @PostMapping("/kml-notice")
    public ApiResponse createKmlNotice(@ModelAttribute KmlNoticePostRequest request) {
        return kmlNoticeService.createKmlNotice(request);
    }
    
}
