package com.bgmagitapi.kml.notice.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePostRequest;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePutRequest;
import com.bgmagitapi.kml.notice.dto.response.KmlNoticeGetResponse;
import com.bgmagitapi.kml.notice.service.KmlNoticeService;
import com.bgmagitapi.page.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
@RestController
public class KmlNoticeController {
    
    private final KmlNoticeService kmlNoticeService;
    
    
    @GetMapping("/kml-notice")
    public PageResponse<KmlNoticeGetResponse> getKmlNotice(@PageableDefault(size = 10) Pageable pageable
            ,@RequestParam(name = "titleAndCont",required = false) String titleAndCont ) {
        Page<KmlNoticeGetResponse> kmlNotice = kmlNoticeService.getKmlNotice(pageable,titleAndCont);
        return PageResponse.from(kmlNotice);
    }
    
    
    @PostMapping("/kml-notice")
    public ApiResponse createKmlNotice(@ModelAttribute KmlNoticePostRequest request) {
        return kmlNoticeService.createKmlNotice(request);
    }
    
    @PutMapping("/kml-notice")
    public ApiResponse updateKmlNotice(@ModelAttribute KmlNoticePutRequest request) {
        return null;
    }
    
}
