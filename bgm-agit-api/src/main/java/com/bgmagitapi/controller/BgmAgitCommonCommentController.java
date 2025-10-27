package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitCommonCommentPostRequest;
import com.bgmagitapi.controller.request.BgmAgitCommonCommentPutRequest;
import com.bgmagitapi.service.BgmAgitCommonCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitCommonCommentController {
    
    private final BgmAgitCommonCommentService bgmAgitCommonCommentService;
    
    @PostMapping("/comment")
    public ApiResponse createComment(@Validated @RequestBody BgmAgitCommonCommentPostRequest request, @AuthenticationPrincipal Jwt jwt) {
        if(jwt == null) {
            throw new RuntimeException("비 로그인입니다.");
        }
        Long memberId = jwt.getClaim("id");
        request.setMemberId(memberId);
        return bgmAgitCommonCommentService.createComment(request);
    }
    
    @PutMapping("/comment")
    public ApiResponse modifyComment(@Validated @RequestBody BgmAgitCommonCommentPutRequest request) {
        return bgmAgitCommonCommentService.modifyComment(request);
    }
}
