package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitCommonCommentPostRequest;
import com.bgmagitapi.controller.request.BgmAgitCommonCommentPutRequest;
import com.bgmagitapi.service.BgmAgitCommonCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitCommonCommentController {
    
    private final BgmAgitCommonCommentService bgmAgitCommonCommentService;
    
    @PostMapping("/comment")
    public ApiResponse createComment(@RequestBody BgmAgitCommonCommentPostRequest request) {
        return bgmAgitCommonCommentService.createComment(request);
    }
    
    @PutMapping("/comment")
    public ApiResponse modifyComment(@RequestBody BgmAgitCommonCommentPutRequest request) {
        return bgmAgitCommonCommentService.modifyComment(request);
    }
}
