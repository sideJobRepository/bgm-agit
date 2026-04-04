package com.bgmagitapi.kml.rank.controller;


import com.bgmagitapi.kml.rank.dto.response.RankGetResponse;
import com.bgmagitapi.kml.rank.enums.RankType;
import com.bgmagitapi.kml.rank.service.RankServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
@RestController
public class RankController {
    
    private final RankServiceImpl  rankService;
    
    @GetMapping("/ranks")
    public List<RankGetResponse> getRanks(@RequestParam RankType type, @RequestParam String baseDate) {
        LocalDate parsedDate = LocalDate.parse(baseDate);
        return rankService.findRanks(type, parsedDate);
    }
}
