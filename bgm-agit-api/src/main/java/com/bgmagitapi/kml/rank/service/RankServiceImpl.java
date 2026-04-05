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
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@RequiredArgsConstructor
@Transactional(readOnly = true)
@Service
public class RankServiceImpl {
    
    private final RankRepository rankRepository;
    public Page<RankGetResponse> findRanks(RankType type, LocalDate baseDate, Pageable pageable) {
        
        LocalDate start;
        LocalDate end;
        
        if (type == RankType.WEEKLY) {
            start = baseDate.with(DayOfWeek.MONDAY);
            end = baseDate.with(DayOfWeek.SUNDAY);
        } else {
            start = baseDate.withDayOfMonth(1);
            end = baseDate.withDayOfMonth(baseDate.lengthOfMonth());
        }
        
        Page<RankGetResponse> ranks = rankRepository.findRanks(start, end, pageable);
        
        List<RankGetResponse> content = ranks.getContent();
        
        for (int i = 0; i < content.size(); i++) {
            
            RankGetResponse r = content.get(i);
            int total = r.getTotalCount();
            
            if (total == 0) continue;
            
            // ===== 진짜 랭킹 (페이지 고려) =====
            int rank = (int) pageable.getOffset() + i + 1;
            r.setRank(rank);
            
            // ===== 퍼센트 =====
            r.setFirstRate(round((r.getFirstCount() * 100.0) / total));
            r.setTop2Rate(round(((r.getFirstCount() + r.getSecondCount()) * 100.0) / total));
            r.setFourthRate(round((r.getFourthCount() * 100.0) / total));
            r.setPlusRate(round((r.getPlusCount() * 100.0) / total));
            r.setMinus2Rate(round((r.getMinus2Count() * 100.0) / total));
            r.setPlus3Rate(round((r.getPlus3Count() * 100.0) / total));
            r.setTobiRate(round((r.getTobiCount() * 100.0) / total));
            r.setTobiMinus3Rate(round((r.getTobiMinus3Count() * 100.0) / total));
            
            // ===== 평균 순위 =====
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
        return Math.round(value * 10) / 10.0; // 소수 1자리
    }
}
