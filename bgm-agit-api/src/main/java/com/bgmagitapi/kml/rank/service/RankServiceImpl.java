package com.bgmagitapi.kml.rank.service;


import com.bgmagitapi.kml.rank.dto.response.RankGetResponse;
import com.bgmagitapi.kml.rank.enums.RankType;
import com.bgmagitapi.kml.rank.repository.RankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@RequiredArgsConstructor
@Transactional(readOnly = true)
@Service
public class RankServiceImpl {
    
    private final RankRepository rankRepository;
    
    public List<RankGetResponse> findRanks(RankType type, LocalDate baseDate) {
        LocalDate start;
        LocalDate end;
        
        if (type == RankType.WEEKLY) {
            start = baseDate.with(DayOfWeek.MONDAY);
            end = baseDate.with(DayOfWeek.SUNDAY);
        } else {
            start = baseDate.withDayOfMonth(1);
            end = baseDate.withDayOfMonth(baseDate.lengthOfMonth());
        }
        
        List<RankGetResponse> ranks = rankRepository.findRanks(start, end);
        AtomicInteger rank = new AtomicInteger(1);
        for (int i = 0; i < ranks.size(); i++) {
            
            RankGetResponse r = ranks.get(i);
            
            int total = r.getTotalCount();
            
            if (total == 0) continue;
            
            // rank
            r.setRank(i + 1);
            
            // 1%
            r.setFirstRate(round((r.getFirstCount() * 100.0) / total));
            
            // 12%
            r.setTop2Rate(round(((r.getFirstCount() + r.getSecondCount()) * 100.0) / total));
            
            // 4%
            r.setFourthRate(round((r.getFourthCount() * 100.0) / total));
            
            // +%
            r.setPlusRate(round((r.getPlusCount() * 100.0) / total));
            
            // -2%
            r.setMinus2Rate(round((r.getMinus2Count() * 100.0) / total));
            
            // +3%
            r.setPlus3Rate(round((r.getPlus3Count() * 100.0) / total));
            
            // 토비% (점수 < 0)
            r.setTobiRate(round((r.getTobiCount() * 100.0) / total));

            // 토비시3%
            // 보통: 토비이면서 3~4등
            r.setTobiMinus3Rate(round((r.getTobiMinus3Count() * 100.0) / total));
            
            // 평균 순위
            double avgRank = (r.getFirstCount() * 1.0 + r.getSecondCount() * 2.0 + r.getThirdCount() * 3.0 + r.getFourthCount() * 4.0) / total;
            
            r.setAvgRank(round(avgRank));
        }
        return ranks;
    }
    
    private double round(double value) {
        return Math.round(value * 10) / 10.0; // 소수 1자리
    }
}
