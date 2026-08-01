package com.bgmagitapi.origin.clocktower.service;

import com.bgmagitapi.origin.murder.dto.response.MonthlyStatsResponse;

public interface BgmAgitClockTowerStatsService {

    MonthlyStatsResponse getMonthly(Integer year, Integer month);
}
