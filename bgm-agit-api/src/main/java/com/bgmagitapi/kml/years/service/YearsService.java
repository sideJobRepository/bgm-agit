package com.bgmagitapi.kml.years.service;

import com.bgmagitapi.kml.years.dto.response.YearRankGetResponse;

import java.util.List;

public interface YearsService {

    List<Integer> getYears();
    
    YearRankGetResponse getYearRanks(Integer year);
}
