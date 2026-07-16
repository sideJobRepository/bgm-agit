package com.bgmagitapi.origin.murder.service.impl;

import com.bgmagitapi.origin.murder.dto.response.MemberMonthlyBucketResponse;
import com.bgmagitapi.origin.murder.dto.response.MemberMonthlyCountResponse;
import com.bgmagitapi.origin.murder.dto.response.MonthlyStatsResponse;
import com.bgmagitapi.origin.murder.repository.BgmAgitPlayRecordRepository;
import com.bgmagitapi.origin.murder.service.BgmAgitPlayStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class BgmAgitPlayStatsServiceImpl implements BgmAgitPlayStatsService {

    private final BgmAgitPlayRecordRepository playRecordRepository;

    @Override
    public MonthlyStatsResponse getMonthly(Integer year, Integer month) {
        LocalDate now = LocalDate.now();
        int y = year != null ? year : now.getYear();
        int m = month != null ? month : now.getMonthValue();

        LocalDate start = LocalDate.of(y, m, 1);
        LocalDate end = start.plusMonths(1);

        List<MemberMonthlyCountResponse> members = playRecordRepository.findMonthlyCounts(start, end);
        long total = playRecordRepository.countSessions(start, end);

        return MonthlyStatsResponse.builder()
                .year(y)
                .month(m)
                .totalCount(total)
                .members(members)
                .build();
    }

    @Override
    public List<MemberMonthlyBucketResponse> getMemberMonthly(Long memberId) {
        return playRecordRepository.findMemberMonthlyBuckets(memberId);
    }
}
