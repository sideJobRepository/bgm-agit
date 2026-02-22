package com.bgmagitapi.kml.years.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.kml.years.dto.response.YearRankGetResponse;
import com.bgmagitapi.kml.years.dto.response.YearsRecordGetResponse;
import com.bgmagitapi.kml.years.service.YearsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import static org.junit.jupiter.api.Assertions.*;

class YearsServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private YearsService yearsService;
    
    @DisplayName("")
    @Test
    void test1(){
        
        YearRankGetResponse yearRanks = yearsService.getYearRanks(null);
        System.out.println("yearRanks = " + yearRanks);
    }
    @DisplayName("")
    @Test
    void test2(){
        PageRequest pageRequest = PageRequest.of(0, 10);
        YearsRecordGetResponse yearsRecords = yearsService.getYearsRecords(pageRequest, 2026);
        System.out.println("yearsRecords = " + yearsRecords);
    }
}