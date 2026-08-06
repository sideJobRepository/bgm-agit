package com.bgmagitapi.kml.rating.controller;


import com.bgmagitapi.kml.rating.dto.MemberStandingResponse;
import com.bgmagitapi.kml.rating.dto.SeasonOptionResponse;
import com.bgmagitapi.kml.rating.service.SeasonService;
import com.bgmagitapi.origin.util.JwtParserUtil;
import lombok.RequiredArgsConstructor;
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


}
