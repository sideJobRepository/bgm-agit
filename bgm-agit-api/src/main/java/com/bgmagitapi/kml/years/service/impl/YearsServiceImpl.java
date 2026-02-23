package com.bgmagitapi.kml.years.service.impl;

import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.matchs.repository.MatchsRepository;
import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.record.enums.Wind;
import com.bgmagitapi.kml.record.repository.RecordRepository;
import com.bgmagitapi.kml.years.dto.response.YearRankGetResponse;
import com.bgmagitapi.kml.years.dto.response.YearsRecordGetResponse;
import com.bgmagitapi.kml.years.service.YearsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class YearsServiceImpl implements YearsService {
    
    
    private static final Map<Wind, Integer> WIND_ORDER = Map.of(Wind.EAST, 0, Wind.SOUTH, 1, Wind.WEST, 2, Wind.NORTH, 3);
    
    private final MatchsRepository  matchsRepository;
    
    private final RecordRepository recordRepository;
    
    @Override
    public List<Integer> getYears() {
        return matchsRepository.getMatchsYears();
    }
    
    @Override
    public YearRankGetResponse getYearRanks(Integer year) {
        return matchsRepository.getYearRanks(year);
    }
    
    @Override
    public YearsRecordGetResponse getYearsRecords(Pageable pageable, Integer year) {
        if (year == null) year = LocalDate.now().getYear();
        
        Page<Long> matchIdsPage = recordRepository.findMatchIdsByYear(pageable, year);
        List<Long> matchIds = matchIdsPage.getContent();
        
        YearsRecordGetResponse response = new YearsRecordGetResponse();
        response.setYear(year);
        
        // 메타
        response.setPageNumber(matchIdsPage.getNumber());
        response.setPageSize(matchIdsPage.getSize());
        response.setTotalElements(matchIdsPage.getTotalElements());
        response.setTotalPages(matchIdsPage.getTotalPages());
        response.setHasNext(matchIdsPage.hasNext());
        response.setHasPrevious(matchIdsPage.hasPrevious());
        
        if (matchIds.isEmpty()) {
            response.setContent(List.of());
            return response;
        }
        
        List<Record> records = recordRepository.findRecordsByMatchIds(matchIds);
        
        Map<Long, List<Record>> groupedByMatch = records.stream()
                .filter(r -> r.getMatchs() != null)
                .collect(Collectors.groupingBy(r -> r.getMatchs().getId()));
        
        List<YearsRecordGetResponse.MatchRecord> matches = matchIds.stream()
                .map(matchId -> {
                    List<Record> group = new ArrayList<>(groupedByMatch.getOrDefault(matchId, List.of()));
                    if (group.isEmpty()) return null;
                    
                    group.sort(Comparator.comparing(Record::getRecordScore).reversed());
                    Record top = group.get(0);
                    
                    YearsRecordGetResponse.MatchRecord dto = new YearsRecordGetResponse.MatchRecord();
                    dto.setMatchsId(matchId);
                    
                    MatchsWind wind = top.getMatchs().getWind();
                    dto.setWind(wind != null ? wind.getValue() : null);
                    
                    dto.setRegistDate(top.getMatchs().getRegistDate());
                    
                    for (int i = 0; i < group.size() && i < 4; i++) {
                        Record rec = group.get(i);
                        String nickname = rec.getMember() != null ? rec.getMember().getBgmAgitMemberNickname() : "";
                        String data = rec.toFormattedString(nickname);
                        
                        switch (i) {
                            case 0 -> dto.setFirst(data);
                            case 1 -> dto.setSecond(data);
                            case 2 -> dto.setThird(data);
                            case 3 -> dto.setFourth(data);
                        }
                    }
                    return dto;
                })
                .filter(Objects::nonNull)
                .toList();
        
        response.setContent(matches);
        return response;
    }
}
