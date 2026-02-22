package com.bgmagitapi.kml.years.controller;

import com.bgmagitapi.kml.years.dto.response.YearRankGetResponse;
import com.bgmagitapi.kml.years.service.YearsService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
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
    
    @GetMapping("/years")
    public YearRankGetResponse getYearsRank(@RequestParam(name = "year",required = false) Integer year) {
        return yearsService.getYearRanks(year);
    }
    
}
