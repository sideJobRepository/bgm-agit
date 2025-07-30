package com.bgmagitapi.controller;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitImageCreateRequest;
import com.bgmagitapi.service.BgmAgitImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitImageController {

    private final BgmAgitImageService bgmAgitImageService;
    
    @PostMapping("/image")
    public ApiResponse createBgmAgitImage(@RequestBody BgmAgitImageCreateRequest request){
        return bgmAgitImageService.createBgmAgitImage(request);
    }
    
    @PutMapping("/image")
    public ApiResponse modifyBgmAgitImage(@RequestBody BgmAgitImageCreateRequest request){
        return bgmAgitImageService.createBgmAgitImage(request);
    }
    
    @DeleteMapping("/image")
    public ApiResponse deleteBgmAgitImage(@RequestBody BgmAgitImageCreateRequest request){
    
    }
}
