package com.bgmagitapi.kml.rating.controller;

import com.bgmagitapi.kml.rating.dto.SeasonCreateRequest;
import com.bgmagitapi.kml.rating.dto.SeasonResponse;
import com.bgmagitapi.kml.rating.dto.SeasonUpdateRequest;
import com.bgmagitapi.kml.rating.service.SeasonService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit/rating/seasons")
public class SeasonController {

    private final SeasonService seasonService;

    /**
     * 시즌 목록 조회 (페이징 없음)
     */
    @GetMapping
    public List<SeasonResponse> getSeasons() {
        return seasonService.getSeasons();
    }

    /**
     * 시즌 생성
     */
    @PostMapping
    public SeasonResponse createSeason(@RequestBody SeasonCreateRequest request) {
        return seasonService.createSeason(request);
    }

    /**
     * 시즌 수정
     */
    @PutMapping("/{seasonId}")
    public SeasonResponse updateSeason(@PathVariable Long seasonId,
                                       @RequestBody SeasonUpdateRequest request) {
        return seasonService.updateSeason(seasonId, request);
    }

    /**
     * 시즌 시작 (대기 -> 진행중)
     */
    @PostMapping("/{seasonId}/start")
    public SeasonResponse startSeason(@PathVariable Long seasonId) {
        return seasonService.startSeason(seasonId);
    }

    /**
     * 시즌 마감 (진행중 -> 종료)
     */
    @PostMapping("/{seasonId}/close")
    public SeasonResponse closeSeason(@PathVariable Long seasonId) {
        return seasonService.closeSeason(seasonId);
    }

    /**
     * 시즌 삭제
     */
    @DeleteMapping("/{seasonId}")
    public void deleteSeason(@PathVariable Long seasonId) {
        seasonService.deleteSeason(seasonId);
    }
}
