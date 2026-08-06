package com.bgmagitapi.kml.rating.controller;


import com.bgmagitapi.kml.rating.dto.MemberStandingRankResponse;
import com.bgmagitapi.kml.rating.dto.MemberStandingResponse;
import com.bgmagitapi.kml.rating.dto.SeasonOptionResponse;
import com.bgmagitapi.kml.rating.service.SeasonService;
import com.bgmagitapi.origin.page.PageResponse;
import com.bgmagitapi.origin.util.JwtParserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class RatingController {

    private final SeasonService seasonService;

    @GetMapping("/rating/seasons/options")
    public List<SeasonOptionResponse> getSeasonOptions(){
        return seasonService.getSeasonOptions();
    }

    /**
     * 현재 시즌의 내 정보
     */
    @GetMapping("/rating/seasons/{seasonId}/standings/me")
    public MemberStandingResponse getMyStanding(
            @PathVariable Long seasonId,
            @AuthenticationPrincipal Jwt jwt
    ){
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return seasonService.getMemberStanding(seasonId, memberId);
    }

    /**
     * 특정 시즌의 전체 회원 랭킹 (레이팅 내림차순, 페이징)
     * 순위, 티어, 사용자 id, 레이팅, 판수, 1위%, 4위%, 평균순위
     */
    @GetMapping("/rating/seasons/{seasonId}/standings")
    public PageResponse<MemberStandingRankResponse> getStandings(
            @PathVariable Long seasonId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return PageResponse.from(seasonService.getStandings(seasonId, pageable));
    }

}
