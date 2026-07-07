package com.bgmagitapi.kml.rank.controller;


import com.bgmagitapi.kml.rank.dto.response.MemberRecentGameResponse;
import com.bgmagitapi.kml.rank.dto.response.MemberStatsResponse;
import com.bgmagitapi.kml.rank.dto.response.RankGetResponse;
import com.bgmagitapi.kml.rank.enums.RankType;
import com.bgmagitapi.kml.rank.service.RankServiceImpl;
import com.bgmagitapi.origin.page.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
@RestController
public class RankController {

    private final RankServiceImpl rankService;

    @GetMapping("/ranks")
    public PageResponse<RankGetResponse> getRanks(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam RankType type,
            @RequestParam(required = false) String baseDate,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTime,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime
    ) {
        LocalDate parsedDate = baseDate != null ? LocalDate.parse(baseDate) : null;
        Page<RankGetResponse> ranks = rankService.findRanks(type, parsedDate, year, month, startDateTime, endDateTime, pageable);
        return PageResponse.from(ranks);
    }

    @GetMapping("/ranks/{memberId}/stats")
    public MemberStatsResponse getMemberStats(
            @PathVariable Long memberId,
            @RequestParam(required = false) Integer year
    ) {
        return rankService.findMemberStats(memberId, year);
    }

    @GetMapping("/ranks/{memberId}/games")
    public PageResponse<MemberRecentGameResponse> getMemberRecentGames(
            @PathVariable Long memberId,
            @RequestParam(required = false) Integer year,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return PageResponse.from(rankService.findMemberRecentGames(memberId, year, pageable));
    }
}
