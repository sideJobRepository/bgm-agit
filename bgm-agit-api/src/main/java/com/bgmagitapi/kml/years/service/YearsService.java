package com.bgmagitapi.kml.years.service;

import com.bgmagitapi.kml.years.dto.response.YearRankGetResponse;
import com.bgmagitapi.kml.years.dto.response.YearsRecordGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface YearsService {

    List<Integer> getYears();
    
    YearRankGetResponse getYearRanks(Integer year);
    
    YearsRecordGetResponse getYearsRecords(Pageable pageable, Integer year);
}
