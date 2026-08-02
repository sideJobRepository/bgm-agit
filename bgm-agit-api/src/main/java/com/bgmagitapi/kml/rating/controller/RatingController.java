package com.bgmagitapi.kml.rating.controller;


import com.bgmagitapi.kml.rating.dto.SeasonOptionResponse;
import com.bgmagitapi.kml.rating.dto.TierResponse;
import com.bgmagitapi.kml.rating.service.SeasonService;
import com.bgmagitapi.kml.rating.service.TierService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class RatingController {

    private final SeasonService seasonService;
    private final TierService tierService;

    @GetMapping("/rating/seasons/options")
    public List<SeasonOptionResponse> getSeasonOptions(){
        return seasonService.getSeasonOptions();
    }

    @GetMapping("/rating/seasons/{seasonId}/tiers")
    public List<TierResponse> getTiers(@PathVariable Long seasonId){
        return tierService.getTiers(seasonId);
    }

}
