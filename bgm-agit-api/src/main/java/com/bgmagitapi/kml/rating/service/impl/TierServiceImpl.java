package com.bgmagitapi.kml.rating.service.impl;

import com.bgmagitapi.kml.rating.dto.TierResponse;
import com.bgmagitapi.kml.rating.entity.Tier;
import com.bgmagitapi.kml.rating.repository.TierRepository;
import com.bgmagitapi.kml.rating.service.TierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class TierServiceImpl implements TierService {

    private final TierRepository tierRepository;

    @Override
    public List<TierResponse> getTiers(Long seasonId) {

        List<Tier> tiers = tierRepository.findBySeasonIdOrderByMinRatingDesc(seasonId);

        return tiers.stream()
                .map(TierResponse::fromDomain)
                .toList();
    }
}
