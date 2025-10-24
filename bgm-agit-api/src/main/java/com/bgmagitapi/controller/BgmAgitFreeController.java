package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.request.BgmAgitFreePostRequest;
import com.bgmagitapi.controller.response.BgmAgitFreeGetResponse;
import com.bgmagitapi.service.BgmAgitFreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitFreeController {

    
    private final BgmAgitFreeService bgmAgitFreeService;
    
    private final S3FileUtils s3FileUtils;
    
    @GetMapping("/free")
    public List<BgmAgitFreeGetResponse> getBgmAgitFree() {
        return bgmAgitFreeService.getBgmAgitFree();
    }
    
    @PostMapping("/free")
    public ApiResponse createBgmAgitFree(@ModelAttribute BgmAgitFreePostRequest request) {
        return bgmAgitFreeService.createBgmAgitFree(request);
    }
    
    
    @PostMapping("/free/file")
    public String noticeFile(@RequestParam("file") MultipartFile file) {
        UploadResult notice = s3FileUtils.storeFile(file, "free");
        return notice.getUrl();
    }
    
}
