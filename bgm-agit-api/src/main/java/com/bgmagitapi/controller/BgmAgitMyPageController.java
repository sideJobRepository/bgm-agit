package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.response.BgmAgitMyPageGetResponse;
import com.bgmagitapi.controller.response.notice.BgmAgitMyPagePutRequest;
import com.bgmagitapi.service.BgmAgitMyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitMyPageController {
    
    private final BgmAgitMyPageService bgmAgitMyPageService;
    
    @GetMapping("/mypage")
    public BgmAgitMyPageGetResponse getMyPage(@AuthenticationPrincipal Jwt jwt) {
        if(jwt == null) {
            throw new RuntimeException("비 로그인입니다.");
        }
        Long memberId = jwt.getClaim("id");
        return bgmAgitMyPageService.getMyPage(memberId);
    }
    @PutMapping("/mypage")
    public ApiResponse modifyMyPage(@AuthenticationPrincipal Jwt jwt,@RequestBody BgmAgitMyPagePutRequest request) {
        if(jwt == null) {
            throw new RuntimeException("비 로그인입니다.");
        }
        Long memberId = jwt.getClaim("id");
        request.setId(memberId);
        return bgmAgitMyPageService.modifyMyPage(request);
    }
}
