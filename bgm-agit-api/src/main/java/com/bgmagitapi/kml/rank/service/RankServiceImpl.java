package com.bgmagitapi.kml.rank.service;


import com.bgmagitapi.kml.rank.dto.response.RankGetResponse;
import com.bgmagitapi.kml.rank.enums.RankType;
import com.bgmagitapi.kml.rank.repository.RankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RequiredArgsConstructor
@Transactional(readOnly = true)
@Service
public class RankServiceImpl {

    private final RankRepository rankRepository;

    public Page<RankGetResponse> findRanks(RankType type,
                                           LocalDate baseDate,
                                           LocalDateTime startDateTime,
                                           LocalDateTime endDateTime,
                                           Pageable pageable) {

        LocalDateTime start;
        LocalDateTime end;

        if (type == RankType.WEEKLY) {
            LocalDate monday = baseDate.with(DayOfWeek.MONDAY);
            start = monday.atStartOfDay();
            end = monday.plusWeeks(1).atStartOfDay();
        } else if (type == RankType.MONTHLY) {
            LocalDate firstOfMonth = baseDate.withDayOfMonth(1);
            start = firstOfMonth.atStartOfDay();
            end = firstOfMonth.plusMonths(1).atStartOfDay();
        } else {
            if (startDateTime == null || endDateTime == null) {
                throw new IllegalArgumentException("사용자 설정에는 시작/종료 일시가 필요합니다.");
            }
            if (!endDateTime.isAfter(startDateTime)) {
                throw new IllegalArgumentException("종료 일시는 시작 일시보다 이후여야 합니다.");
            }
            start = startDateTime;
            end = endDateTime;
        }

        Page<RankGetResponse> ranks = rankRepository.findRanks(start, end, pageable);

        List<RankGetResponse> content = ranks.getContent();

        for (int i = 0; i < content.size(); i++) {

            RankGetResponse r = content.get(i);
            int total = r.getTotalCount();

            if (total == 0) continue;

            int rank = (int) pageable.getOffset() + i + 1;
            r.setRank(rank);

            r.setFirstRate(round((r.getFirstCount() * 100.0) / total));
            r.setTop2Rate(round(((r.getFirstCount() + r.getSecondCount()) * 100.0) / total));
            r.setFourthRate(round((r.getFourthCount() * 100.0) / total));
            r.setPlusRate(round((r.getPlusCount() * 100.0) / total));
            r.setMinus2Rate(round((r.getMinus2Count() * 100.0) / total));
            r.setPlus3Rate(round((r.getPlus3Count() * 100.0) / total));
            r.setTobiRate(round((r.getTobiCount() * 100.0) / total));
            r.setTobiMinus3Rate(round((r.getTobiMinus3Count() * 100.0) / total));

            double avgRank =
                    (r.getFirstCount() * 1.0 +
                            r.getSecondCount() * 2.0 +
                            r.getThirdCount() * 3.0 +
                            r.getFourthCount() * 4.0) / total;

            r.setAvgRank(round(avgRank));
        }

        return ranks;
    }

    private double round(double value) {
        return Math.round(value * 10) / 10.0;
    }
}
