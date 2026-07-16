package com.bgmagitapi.origin.clocktower.controller;

import com.bgmagitapi.origin.clocktower.service.BgmAgitClockTowerStatsService;
import com.bgmagitapi.origin.murder.dto.response.MonthlyStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitClockTowerStatsController {

    private final BgmAgitClockTowerStatsService bgmAgitClockTowerStatsService;

    @GetMapping("/clocktower-stats/monthly")
    public MonthlyStatsResponse getMonthly(@RequestParam(name = "year", required = false) Integer year,
                                           @RequestParam(name = "month", required = false) Integer month) {
        return bgmAgitClockTowerStatsService.getMonthly(year, month);
    }
}
