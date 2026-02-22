package com.bgmagitapi.kml.years.controller;

import com.bgmagitapi.kml.record.dto.response.RecordGetResponse;
import com.bgmagitapi.kml.years.dto.response.YearRankGetResponse;
import com.bgmagitapi.kml.years.dto.response.YearsRecordGetResponse;
import com.bgmagitapi.kml.years.service.YearsService;
import com.bgmagitapi.page.PageResponse;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class YearsController {
    
    private final YearsService yearsService;
    
    @GetMapping("/years-select")
    public List<Integer> getMatchsYears(){
        return yearsService.getYears();
    }
    
    @GetMapping("/years-rank")
    public YearRankGetResponse getYearsRank(@RequestParam(name = "year",required = false) Integer year) {
        return yearsService.getYearRanks(year);
    }
    
    @GetMapping("/years-record")
    public YearsRecordGetResponse getRecord(@PageableDefault(size = 10) Pageable pageable, @RequestParam(required = false) Integer year) {
        return yearsService.getYearsRecords(pageable, year);
    }
}
