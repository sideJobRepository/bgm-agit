package com.bgmagitapi.kml.rating.controller;

import com.bgmagitapi.kml.rating.dto.TierResponse;
import com.bgmagitapi.kml.rating.dto.TierSaveRequest;
import com.bgmagitapi.kml.rating.service.TierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class TierController {

    private final TierService tierService;

    /**
     * 특정 시즌의 등급 목록 조회 (최소 레이팅 내림차순)
     */
    @GetMapping("/rating/seasons/{seasonId}/tiers")
    public List<TierResponse> getTiers(@PathVariable Long seasonId) {
        return tierService.getTiers(seasonId);
    }

    /**
     * 특정 시즌의 등급 목록 저장 (기존 등급 전체를 요청 목록으로 덮어씀)
     */
    @PutMapping("/rating/seasons/{seasonId}/tiers")
    public List<TierResponse> saveTiers(@PathVariable Long seasonId,
                                        @Valid @RequestBody TierSaveRequest request) {
        return tierService.saveTiers(seasonId, request);
    }
}
