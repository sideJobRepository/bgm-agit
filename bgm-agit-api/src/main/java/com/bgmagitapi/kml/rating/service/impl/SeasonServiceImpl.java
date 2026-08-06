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
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SeasonServiceImpl implements SeasonService {

    private final BgmAgitMemberRepository memberRepository;

    private final SeasonRepository seasonRepository;
    private final TierRepository tierRepository;
    private final SeasonStandingRepository seasonStandingRepository;
    private final RatingRepository ratingRepository;

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

    @Override
    public MemberStandingResponse getMemberStanding(Long seasonId, Long memberId) {
        Season season = seasonRepository.findByIdActive(seasonId)
                .orElseThrow(() -> new SeasonNotFoundException("시즌이 존재하지 않습니다. seasonId=" + seasonId));

        Tiers tiers = new Tiers(tierRepository.findBySeasonIdOrderByMinRatingDesc(seasonId));

        BgmAgitMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("사용자가 존재하지 않습니다. memberId=" + memberId));

        SeasonStanding seasonStanding = seasonStandingRepository.findByMemberId(memberId)
                .orElseThrow(() -> new SeasonStandingNotFoundException("순위 정보를 찾을 수 없습니다."));

        Tier tier = tiers.getTierBy(seasonStanding.getRating());
        Optional<Tier> nextTier = tiers.getNextTier(tier);

        Ratings ratings = new Ratings(ratingRepository.findByMemberId(memberId));
        Optional<Rating> seasonHigh = ratings.getSeasonHigh();
        Optional<Rating> seasonLow = ratings.getSeasonLow();
        List<Rating> recentRatings = ratings.getRecent(5);

        return MemberStandingResponse.builder()
                .seasonId(seasonId)
                .seasonName(season.getName())
                .memberId(memberId)
                .memberName(member.getBgmAgitMemberName())
                .rating(seasonStanding.getRating())
                .gameCount(ratings.size())
                .tierName(tier.getName())
                .tierMinRating(tier.getMinRating())
                .nextTierName(nextTier.map(Tier::getName).orElse(null))
                .nextTierMinRating(nextTier.map(Tier::getMinRating).orElse(null))
                .pointsToNextTier(nextTier.map(value -> value.pointsToReach(seasonStanding.getRating())).orElse(null))
                .seasonHigh(seasonHigh.map(Rating::getRatingResult).orElse(null))
                .seasonHighDateTime(seasonHigh.map(Rating::getRegistDate).orElse(null))
                .seasonLow(seasonLow.map(Rating::getRatingResult).orElse(null))
                .seasonLowDateTime(seasonLow.map(Rating::getRegistDate).orElse(null))
                .recentDeltas(recentRatings.stream().map(i -> i.getRatingValue()).toList())
                .build();
    }

    @Override
    public Page<MemberStandingRankResponse> getStandings(Long seasonId, Pageable pageable) {
        seasonRepository.findByIdActive(seasonId)
                .orElseThrow(() -> new SeasonNotFoundException("시즌이 존재하지 않습니다. seasonId=" + seasonId));

        Tiers tiers = new Tiers(tierRepository.findBySeasonIdOrderByMinRatingDesc(seasonId));

        Page<SeasonStandingRow> page = seasonStandingRepository.findStandings(seasonId, pageable);

        int base = (int) pageable.getOffset();
        List<MemberStandingRankResponse> content = new ArrayList<>();
        int index = 0;
        for (SeasonStandingRow row : page.getContent()) {
            Tier tier = tiers.getTierBy(row.rating());
            content.add(MemberStandingRankResponse.builder()
                    .seasonRank(base + index + 1)
                    .tierName(tier.getName())
                    .memberId(row.memberId())
                    .memberNickname(row.memberNickname())
                    .rating(row.rating())
                    .gameCount(row.gameCount())
                    .firstRate(rate(row.firstCount(), row.gameCount()))
                    .fourthRate(rate(row.fourthCount(), row.gameCount()))
                    .avgRank(round(row.avgRank()))
                    .build());
            index++;
        }

        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    private static double rate(long count, long total) {
        if (total <= 0) {
            return 0.0;
        }
        return Math.round((count * 100.0 / total) * 10) / 10.0;
    }

    private static double round(Double value) {
        if (value == null) {
            return 0.0;
        }
        return Math.round(value * 100) / 100.0;
    }
}
