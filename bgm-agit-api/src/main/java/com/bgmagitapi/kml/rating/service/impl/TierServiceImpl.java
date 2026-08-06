package com.bgmagitapi.kml.rating.service.impl;

import com.bgmagitapi.kml.rating.dto.TierResponse;
import com.bgmagitapi.kml.rating.dto.TierSaveRequest;
import com.bgmagitapi.kml.rating.entity.Season;
import com.bgmagitapi.kml.rating.entity.Tier;
import com.bgmagitapi.kml.rating.exception.SeasonNotFoundException;
import com.bgmagitapi.kml.rating.repository.SeasonRepository;
import com.bgmagitapi.kml.rating.repository.TierRepository;
import com.bgmagitapi.kml.rating.service.TierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class TierServiceImpl implements TierService {

    private final TierRepository tierRepository;
    private final SeasonRepository seasonRepository;

    @Override
    public List<TierResponse> getTiers(Long seasonId) {

        List<Tier> tiers = tierRepository.findBySeasonIdOrderByMinRatingDesc(seasonId);

        return tiers.stream()
                .map(TierResponse::fromDomain)
                .toList();
    }

    @Override
    @Transactional
    public List<TierResponse> saveTiers(Long seasonId, TierSaveRequest request) {

        Season season = seasonRepository.findByIdActive(seasonId)
                .orElseThrow(() -> new SeasonNotFoundException("시즌이 존재하지 않습니다. seasonId=" + seasonId));

        // 기존 등급을 전부 지우고 새 목록으로 덮어씀
        tierRepository.deleteBySeasonId(seasonId);
        tierRepository.flush();

        List<TierSaveRequest.TierItem> items = request.getTiers() == null
                ? List.of()
                : request.getTiers();

        List<Tier> tiers = items.stream()
                .map(item -> Tier.builder()
                        .season(season)
                        .name(item.getName())
                        .minRating(item.getMinRating())
                        .build())
                .toList();

        List<Tier> saved = tierRepository.saveAll(tiers);

        return saved.stream()
                .sorted(Comparator.comparing(Tier::getMinRating).reversed())
                .map(TierResponse::fromDomain)
                .toList();
    }
}
