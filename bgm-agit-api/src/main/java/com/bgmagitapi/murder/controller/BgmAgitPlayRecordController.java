package com.bgmagitapi.murder.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.murder.dto.request.PlayRecordCreateRequest;
import com.bgmagitapi.murder.dto.request.PlayRecordModifyRequest;
import com.bgmagitapi.murder.dto.response.AllMemberResponse;
import com.bgmagitapi.murder.dto.response.MemberHistoryResponse;
import com.bgmagitapi.murder.dto.response.PlayRecordDetailResponse;
import com.bgmagitapi.murder.dto.response.PlayRecordListResponse;
import com.bgmagitapi.murder.service.BgmAgitPlayRecordService;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.util.JwtParserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitPlayRecordController {

    private final BgmAgitPlayRecordService bgmAgitPlayRecordService;

    @GetMapping("/play-records")
    public PageResponse<PlayRecordListResponse> getPlayRecords(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(name = "gameId", required = false) Long gameId,
            @RequestParam(name = "memberId", required = false) Long memberId,
            @RequestParam(name = "year", required = false) Integer year,
            @RequestParam(name = "month", required = false) Integer month) {
        return PageResponse.from(bgmAgitPlayRecordService.getPlayRecords(pageable, gameId, memberId, year, month));
    }

    // 회원 플레이 이력 (리마인딩). memberId 생략 시 본인(JWT) 기준.
    @GetMapping("/play-records/my-history")
    public MemberHistoryResponse getMyHistory(@RequestParam(name = "memberId", required = false) Long memberId,
                                              @AuthenticationPrincipal Jwt jwt) {
        Long target = memberId != null ? memberId : JwtParserUtil.extractMemberId(jwt);
        return bgmAgitPlayRecordService.getMemberHistory(target);
    }

    @GetMapping("/play-records/{id}")
    public PlayRecordDetailResponse getPlayRecord(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return bgmAgitPlayRecordService.getPlayRecord(id,
                JwtParserUtil.extractMemberId(jwt), JwtParserUtil.extractRoles(jwt));
    }

    @PostMapping("/play-records")
    public ApiResponse createPlayRecord(@Validated @RequestBody PlayRecordCreateRequest request,
                                        @AuthenticationPrincipal Jwt jwt) {
        return bgmAgitPlayRecordService.createPlayRecord(request, JwtParserUtil.extractMemberId(jwt));
    }

    @PutMapping("/play-records/{id}")
    public ApiResponse modifyPlayRecord(@PathVariable Long id,
                                        @Validated @RequestBody PlayRecordModifyRequest request,
                                        @AuthenticationPrincipal Jwt jwt) {
        return bgmAgitPlayRecordService.modifyPlayRecord(id, request,
                JwtParserUtil.extractMemberId(jwt), JwtParserUtil.extractRoles(jwt));
    }

    @DeleteMapping("/play-records/{id}")
    public ApiResponse deletePlayRecord(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return bgmAgitPlayRecordService.deletePlayRecord(id,
                JwtParserUtil.extractMemberId(jwt), JwtParserUtil.extractRoles(jwt));
    }

    // 참가자 멀티셀렉트용 회원 검색
    @GetMapping("/all-members")
    public List<AllMemberResponse> getAllMembers(@RequestParam(name = "keyword", required = false) String keyword) {
        return bgmAgitPlayRecordService.searchMembers(keyword);
    }
}
