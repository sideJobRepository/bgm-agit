package com.bgmagitapi.kml.rating.service.impl;

import com.bgmagitapi.kml.rating.domain.RatingCalculator;
import com.bgmagitapi.kml.rating.domain.Ratings;
import com.bgmagitapi.kml.rating.domain.Tiers;
import com.bgmagitapi.kml.rating.dto.MemberStandingResponse;
import com.bgmagitapi.kml.rating.dto.SeasonOptionResponse;
import com.bgmagitapi.kml.rating.entity.*;
import com.bgmagitapi.kml.rating.enums.SeasonProgressStatus;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public MemberStandingResponse getMemberStanding(Long seasonId, Long memberId) {
        Season season = seasonRepository.findById(seasonId)
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
}
