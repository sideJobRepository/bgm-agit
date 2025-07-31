package com.bgmagitapi.controller;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitImageCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitImageModifyRequest;
import com.bgmagitapi.service.BgmAgitImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitImageController {

    private final BgmAgitImageService bgmAgitImageService;

    @PostMapping("/image")
    public ApiResponse createBgmAgitImage(@ModelAttribute BgmAgitImageCreateRequest request){
        return bgmAgitImageService.createBgmAgitImage(request);
    }

    @PutMapping("/image")
    public ApiResponse modifyBgmAgitImage(@Validated @ModelAttribute BgmAgitImageModifyRequest request){
        return bgmAgitImageService.modifyBgmAgitImage(request);
    }

    @DeleteMapping("/image/{imageId}")
    public ApiResponse deleteBgmAgitImage(@PathVariable Long imageId ){
        return bgmAgitImageService.deleteBgmAgitImage(imageId);
    }
}
