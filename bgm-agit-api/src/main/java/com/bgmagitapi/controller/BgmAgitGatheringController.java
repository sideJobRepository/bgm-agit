package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitGatheringApplyRequest;
import com.bgmagitapi.controller.request.BgmAgitGatheringCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitGatheringModifyRequest;
import com.bgmagitapi.controller.request.BgmAgitGatheringParticipantUpdateRequest;
import com.bgmagitapi.controller.response.BgmAgitGatheringDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitGatheringListResponse;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.service.BgmAgitGatheringService;
import com.bgmagitapi.util.JwtParserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitGatheringController {

    private final BgmAgitGatheringService bgmAgitGatheringService;

    @GetMapping("/gatherings")
    public PageResponse<BgmAgitGatheringListResponse> getGatherings(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "status", required = false) String status) {
        Page<BgmAgitGatheringListResponse> page = bgmAgitGatheringService.getGatherings(pageable, type, status);
        return PageResponse.from(page);
    }

    @GetMapping("/gatherings/{id}")
    public BgmAgitGatheringDetailResponse getGatheringDetail(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return bgmAgitGatheringService.getGatheringDetail(id, memberId, JwtParserUtil.extractRoles(jwt));
    }

    @PostMapping("/gatherings")
    public ApiResponse createGathering(@Validated @RequestBody BgmAgitGatheringCreateRequest request,
                                       @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return bgmAgitGatheringService.createGathering(request, memberId);
    }

    @PutMapping("/gatherings/{id}")
    public ApiResponse modifyGathering(@PathVariable Long id,
                                       @Validated @RequestBody BgmAgitGatheringModifyRequest request,
                                       @AuthenticationPrincipal Jwt jwt) {
        return bgmAgitGatheringService.modifyGathering(id, request,
                JwtParserUtil.extractMemberId(jwt), JwtParserUtil.extractRoles(jwt));
    }

    @DeleteMapping("/gatherings/{id}")
    public ApiResponse deleteGathering(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return bgmAgitGatheringService.deleteGathering(id,
                JwtParserUtil.extractMemberId(jwt), JwtParserUtil.extractRoles(jwt));
    }

    @PostMapping("/gatherings/{id}/apply")
    public ApiResponse apply(@PathVariable Long id,
                             @RequestBody(required = false) BgmAgitGatheringApplyRequest request,
                             @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return bgmAgitGatheringService.apply(id, request, memberId);
    }

    @DeleteMapping("/gatherings/{id}/apply")
    public ApiResponse cancelApply(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return bgmAgitGatheringService.cancelApply(id, memberId);
    }

    @PutMapping("/gatherings/{id}/participants/{participantId}")
    public ApiResponse updateParticipant(@PathVariable Long id,
                                         @PathVariable Long participantId,
                                         @RequestBody BgmAgitGatheringParticipantUpdateRequest request,
                                         @AuthenticationPrincipal Jwt jwt) {
        return bgmAgitGatheringService.updateParticipant(id, participantId, request,
                JwtParserUtil.extractMemberId(jwt), JwtParserUtil.extractRoles(jwt));
    }
}
