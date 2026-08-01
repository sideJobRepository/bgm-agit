package com.bgmagitapi.origin.murder.controller;

import com.bgmagitapi.origin.murder.dto.response.MemberMonthlyBucketResponse;
import com.bgmagitapi.origin.murder.dto.response.MonthlyStatsResponse;
import com.bgmagitapi.origin.murder.service.BgmAgitPlayStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitPlayStatsController {

    private final BgmAgitPlayStatsService bgmAgitPlayStatsService;

    // 이번달(또는 지정 월) 게임 랭킹. year/month 생략 시 현재월.
    @GetMapping("/play-stats/monthly")
    public MonthlyStatsResponse getMonthly(@RequestParam(name = "year", required = false) Integer year,
                                           @RequestParam(name = "month", required = false) Integer month) {
        return bgmAgitPlayStatsService.getMonthly(year, month);
    }

    @GetMapping("/play-stats/members/{memberId}/monthly")
    public List<MemberMonthlyBucketResponse> getMemberMonthly(@PathVariable Long memberId) {
        return bgmAgitPlayStatsService.getMemberMonthly(memberId);
    }
}
