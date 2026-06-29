package com.bgmagitapi.clocktower.service;

import com.bgmagitapi.murder.dto.response.MonthlyStatsResponse;

public interface BgmAgitClockTowerStatsService {

    MonthlyStatsResponse getMonthly(Integer year, Integer month);
}
