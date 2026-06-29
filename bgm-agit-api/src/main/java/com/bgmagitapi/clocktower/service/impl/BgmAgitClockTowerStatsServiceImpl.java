package com.bgmagitapi.clocktower.service.impl;

import com.bgmagitapi.clocktower.repository.BgmAgitClockTowerRecordRepository;
import com.bgmagitapi.clocktower.service.BgmAgitClockTowerStatsService;
import com.bgmagitapi.murder.dto.response.MemberMonthlyCountResponse;
import com.bgmagitapi.murder.dto.response.MonthlyStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class BgmAgitClockTowerStatsServiceImpl implements BgmAgitClockTowerStatsService {

    private final BgmAgitClockTowerRecordRepository recordRepository;

    @Override
    public MonthlyStatsResponse getMonthly(Integer year, Integer month) {
        LocalDate now = LocalDate.now();
        int y = year != null ? year : now.getYear();
        int m = month != null ? month : now.getMonthValue();

        LocalDate start = LocalDate.of(y, m, 1);
        LocalDate end = start.plusMonths(1);

        List<MemberMonthlyCountResponse> members = recordRepository.findMonthlyCounts(start, end);
        long total = recordRepository.countSessions(start, end);

        return MonthlyStatsResponse.builder()
                .year(y)
                .month(m)
                .totalCount(total)
                .members(members)
                .build();
    }
}
