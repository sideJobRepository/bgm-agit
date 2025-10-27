package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.request.BgmAgitFreePostRequest;
import com.bgmagitapi.controller.request.BgmAgitFreePutRequest;
import com.bgmagitapi.controller.response.BgmAgitFreeGetDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitFreeGetResponse;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.service.BgmAgitFreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitFreeController {

    
    private final BgmAgitFreeService bgmAgitFreeService;
    
    private final S3FileUtils s3FileUtils;
    
    @GetMapping("/free")
    public PageResponse<BgmAgitFreeGetResponse> getBgmAgitFree(@PageableDefault(size = 10) Pageable pageable) {
        return bgmAgitFreeService.getBgmAgitFree(pageable);
    }
    
    @GetMapping("/free/{id}")
    public BgmAgitFreeGetDetailResponse getBgmAgitFreeDetail(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = null;
        if (jwt != null) {
            Object claimValue = jwt.getClaim("id");
            if (claimValue != null) {
                memberId = Long.valueOf(String.valueOf(claimValue));
            }
        }
        return bgmAgitFreeService.getBgmAgitFreeDetail(id,memberId);
    }
    
    @PostMapping("/free")
    public ApiResponse createBgmAgitFree(@Validated @ModelAttribute BgmAgitFreePostRequest request) {
        return bgmAgitFreeService.createBgmAgitFree(request);
    }
    @PutMapping("/free")
    public ApiResponse modifyBgmAgitFree(@Validated @ModelAttribute BgmAgitFreePutRequest request) {
        return bgmAgitFreeService.modifyBgmAgitFree(request);
    }
    
    
    @PostMapping("/free/file")
    public String noticeFile(@RequestParam("file") MultipartFile file) {
        UploadResult notice = s3FileUtils.storeFile(file, "free");
        return notice.getUrl();
    }
    
}
