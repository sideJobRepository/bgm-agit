package com.bgmagitapi.kml.years.service.impl;

import com.bgmagitapi.kml.matchs.repository.MatchsRepository;
import com.bgmagitapi.kml.years.dto.response.YearRankGetResponse;
import com.bgmagitapi.kml.years.service.YearsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class YearsServiceImpl implements YearsService {
    
    private final MatchsRepository  matchsRepository;
    
    @Override
    public List<Integer> getYears() {
        return matchsRepository.getMatchsYears();
    }
    
    @Override
    public YearRankGetResponse getYearRanks(Integer year) {
        return matchsRepository.getYearRanks(year);
    }
}
