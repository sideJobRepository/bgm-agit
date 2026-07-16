package com.bgmagitapi.origin.clocktower.controller;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerRecordCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerRecordModifyRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerRecordDetailResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerRecordListResponse;
import com.bgmagitapi.origin.clocktower.service.BgmAgitClockTowerRecordService;
import com.bgmagitapi.origin.murder.dto.response.MemberHistoryResponse;
import com.bgmagitapi.origin.page.PageResponse;
import com.bgmagitapi.origin.util.JwtParserUtil;
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
public class BgmAgitClockTowerRecordController {

    private final BgmAgitClockTowerRecordService bgmAgitClockTowerRecordService;

    @GetMapping("/clocktower-records")
    public PageResponse<ClockTowerRecordListResponse> getRecords(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(name = "gameId", required = false) Long gameId,
            @RequestParam(name = "memberId", required = false) Long memberId,
            @RequestParam(name = "year", required = false) Integer year,
            @RequestParam(name = "month", required = false) Integer month,
            @AuthenticationPrincipal Jwt jwt) {
        Long viewerId = jwt != null ? JwtParserUtil.extractMemberId(jwt) : null;
        List<String> roles = jwt != null ? JwtParserUtil.extractRoles(jwt) : null;
        boolean isAdmin = roles != null && (roles.contains("ROLE_ADMIN") || roles.contains("ADMIN"));
        return PageResponse.from(bgmAgitClockTowerRecordService.getRecords(pageable, gameId, memberId, year, month, viewerId, isAdmin));
    }

    @GetMapping("/clocktower-records/my-history")
    public MemberHistoryResponse getMyHistory(@RequestParam(name = "memberId", required = false) Long memberId,
                                              @AuthenticationPrincipal Jwt jwt) {
        Long target = memberId != null ? memberId : JwtParserUtil.extractMemberId(jwt);
        return bgmAgitClockTowerRecordService.getMemberHistory(target);
    }

    @GetMapping("/clocktower-records/{id}")
    public ClockTowerRecordDetailResponse getRecord(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return bgmAgitClockTowerRecordService.getRecord(id,
                JwtParserUtil.extractMemberId(jwt), JwtParserUtil.extractRoles(jwt));
    }

    @PostMapping("/clocktower-records")
    public ApiResponse createRecord(@Validated @RequestBody ClockTowerRecordCreateRequest request,
                                    @AuthenticationPrincipal Jwt jwt) {
        return bgmAgitClockTowerRecordService.createRecord(request, JwtParserUtil.extractMemberId(jwt));
    }

    @PutMapping("/clocktower-records/{id}")
    public ApiResponse modifyRecord(@PathVariable Long id,
                                    @Validated @RequestBody ClockTowerRecordModifyRequest request,
                                    @AuthenticationPrincipal Jwt jwt) {
        return bgmAgitClockTowerRecordService.modifyRecord(id, request,
                JwtParserUtil.extractMemberId(jwt), JwtParserUtil.extractRoles(jwt));
    }

    @DeleteMapping("/clocktower-records/{id}")
    public ApiResponse deleteRecord(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return bgmAgitClockTowerRecordService.deleteRecord(id,
                JwtParserUtil.extractMemberId(jwt), JwtParserUtil.extractRoles(jwt));
    }
}
