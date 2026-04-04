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
    
    public List<RankGetResponse>  findRanks(RankType type, LocalDate baseDate) {
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
        
        ranks.forEach(r -> r.setRank(rank.getAndIncrement()));
        return ranks;
    }
}
