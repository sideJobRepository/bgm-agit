package com.bgmagitapi.kml.rank.controller;


import com.bgmagitapi.kml.rank.dto.response.RankGetResponse;
import com.bgmagitapi.kml.rank.enums.RankType;
import com.bgmagitapi.kml.rank.service.RankServiceImpl;
import com.bgmagitapi.page.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
    public PageResponse<RankGetResponse> getRanks(@PageableDefault(size = 20) Pageable pageable, @RequestParam RankType type, @RequestParam String baseDate) {
        LocalDate parsedDate = LocalDate.parse(baseDate);
        Page<RankGetResponse> ranks = rankService.findRanks(type, parsedDate, pageable);
        return PageResponse.from(ranks);
    }
}
