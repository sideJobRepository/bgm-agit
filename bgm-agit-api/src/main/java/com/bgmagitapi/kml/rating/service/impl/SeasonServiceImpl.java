package com.bgmagitapi.kml.rating.service.impl;

import com.bgmagitapi.kml.rating.domain.Ratings;
import com.bgmagitapi.kml.rating.domain.Tiers;
import com.bgmagitapi.kml.rating.dto.MemberStandingRankResponse;
import com.bgmagitapi.kml.rating.dto.MemberStandingResponse;
import com.bgmagitapi.kml.rating.dto.SeasonCreateRequest;
import com.bgmagitapi.kml.rating.dto.SeasonOptionResponse;
import com.bgmagitapi.kml.rating.dto.SeasonResponse;
import com.bgmagitapi.kml.rating.dto.SeasonStandingRow;
import com.bgmagitapi.kml.rating.dto.SeasonUpdateRequest;
import com.bgmagitapi.kml.rating.entity.*;
import com.bgmagitapi.kml.rating.enums.SeasonProgressStatus;
import com.bgmagitapi.kml.rating.exception.MultipleOngoingSeasonException;
import com.bgmagitapi.kml.rating.exception.OngoingSeasonExistsException;
import com.bgmagitapi.kml.rating.exception.SeasonNotFoundException;
import com.bgmagitapi.kml.rating.exception.SeasonStandingNotFoundException;
import com.bgmagitapi.kml.rating.repository.RatingRepository;
import com.bgmagitapi.kml.rating.repository.SeasonRepository;
import com.bgmagitapi.kml.rating.repository.SeasonStandingRepository;
import com.bgmagitapi.kml.rating.repository.TierRepository;
import com.bgmagitapi.kml.rating.service.SeasonService;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SeasonServiceImpl implements SeasonService {

    private final SeasonRepository seasonRepository;

    @Override
    public Season getSeason(Long seasonId) {
        return seasonRepository.findByIdActive(seasonId)
                .orElseThrow(() -> new SeasonNotFoundException("시즌이 존재하지 않습니다. seasonId=" + seasonId));
    }

    @Override
    public Optional<Season> getOngoingSeason() {
        List<Season> ongoingSeasons = seasonRepository.findAllByProgressStatus(SeasonProgressStatus.ONGOING);

        if(ongoingSeasons.size() > 1)
            throw new MultipleOngoingSeasonException();

        return ongoingSeasons
                .stream()
                .findFirst();
    }

    @Override
    public Season getLastClosedSeason() {
        return seasonRepository.findAllByProgressStatus(SeasonProgressStatus.CLOSED).stream()
                .max(Comparator.comparing(Season::getEndDate))
                .orElseThrow(() -> new SeasonNotFoundException("종료된 시즌이 존재하지 않습니다."));
    }

    @Override
    public List<SeasonOptionResponse> getSeasonOptions() {
        return Stream.concat(
                        seasonRepository.findAllByProgressStatus(SeasonProgressStatus.ONGOING).stream(),
                        seasonRepository.findAllByProgressStatus(SeasonProgressStatus.CLOSED).stream()
                )
                .map(SeasonOptionResponse::fromDomain)
                .toList();
    }

    @Override
    public List<SeasonResponse> getSeasons() {
        return seasonRepository.findAllActive().stream()
                .sorted(Comparator
                        // 진행중인 시즌을 맨 앞으로
                        .comparing((Season s) -> s.getProgressStatus() == SeasonProgressStatus.ONGOING ? 0 : 1)
                        // 나머지는 시작일 기준 내림차순
                        .thenComparing(Comparator.comparing(Season::getStartDate).reversed()))
                .map(SeasonResponse::fromDomain)
                .toList();
    }

    @Override
    @Transactional
    public SeasonResponse createSeason(SeasonCreateRequest request) {
        Season season = seasonRepository.save(Season.create(request));
        return SeasonResponse.fromDomain(season);
    }

    @Override
    @Transactional
    public SeasonResponse updateSeason(Long seasonId, SeasonUpdateRequest request) {
        Season season = seasonRepository.findByIdActive(seasonId)
                .orElseThrow(() -> new SeasonNotFoundException("시즌이 존재하지 않습니다. seasonId=" + seasonId));

        season.update(
                request.getName(),
                request.getStartDate(),
                request.getEndDate(),
                request.getResetType(),
                request.getCarryRate(),
                request.getBaseRating(),
                request.getFirstScore(),
                request.getSecondScore(),
                request.getThirdScore(),
                request.getFourthScore(),
                request.getEastMultiple(),
                request.getSouthMultiple(),
                request.getWestMultiple(),
                request.getNorthMultiple()
        );

        return SeasonResponse.fromDomain(season);
    }

    @Override
    @Transactional
    public SeasonResponse startSeason(Long seasonId) {
        if (seasonRepository.existsByProgressStatus(SeasonProgressStatus.ONGOING)) {
            throw new OngoingSeasonExistsException();
        }

        Season season = seasonRepository.findByIdActive(seasonId)
                .orElseThrow(() -> new SeasonNotFoundException("시즌이 존재하지 않습니다. seasonId=" + seasonId));

        season.start();

        return SeasonResponse.fromDomain(season);
    }

    @Override
    @Transactional
    public SeasonResponse closeSeason(Long seasonId) {
        Season season = seasonRepository.findByIdActive(seasonId)
                .orElseThrow(() -> new SeasonNotFoundException("시즌이 존재하지 않습니다. seasonId=" + seasonId));

        season.close();

        return SeasonResponse.fromDomain(season);
    }

    @Override
    @Transactional
    public void deleteSeason(Long seasonId) {
        Season season = seasonRepository.findByIdActive(seasonId)
                .orElseThrow(() -> new SeasonNotFoundException("시즌이 존재하지 않습니다. seasonId=" + seasonId));

        season.delete();
    }




}
