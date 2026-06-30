package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitMyPasswordChangeRequest;
import com.bgmagitapi.controller.response.BgmAgitMyPageGetResponse;
import com.bgmagitapi.controller.response.notice.BgmAgitMyPagePutRequest;
import com.bgmagitapi.service.BgmAgitMyPageService;
import jakarta.validation.Valid;
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
    public ApiResponse modifyMyPage(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody BgmAgitMyPagePutRequest request) {
        if(jwt == null) {
            throw new RuntimeException("비 로그인입니다.");
        }
        Long memberId = jwt.getClaim("id");
        request.setId(memberId);
        return bgmAgitMyPageService.modifyMyPage(request);
    }

    @PutMapping("/mypage/password")
    public ApiResponse changeMyPassword(@AuthenticationPrincipal Jwt jwt,
                                        @Valid @RequestBody BgmAgitMyPasswordChangeRequest request) {
        if (jwt == null) {
            throw new RuntimeException("비 로그인입니다.");
        }
        Long memberId = jwt.getClaim("id");
        return bgmAgitMyPageService.changeMyPassword(memberId, request);
    }

    // 마작(BML) 기록 이용 신청 — 보드게임 회원이 KML 등록되고 마작 검색에 노출되도록 전환
    @PostMapping("/mahjong-use")
    public ApiResponse applyMahjongUse(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            throw new RuntimeException("비 로그인입니다.");
        }
        Long memberId = jwt.getClaim("id");
        return bgmAgitMyPageService.applyMahjongUse(memberId);
    }

    // 마작(BML) 기록 이용 해지 (실수 신청 취소)
    @DeleteMapping("/mahjong-use")
    public ApiResponse cancelMahjongUse(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            throw new RuntimeException("비 로그인입니다.");
        }
        Long memberId = jwt.getClaim("id");
        return bgmAgitMyPageService.cancelMahjongUse(memberId);
    }
}
