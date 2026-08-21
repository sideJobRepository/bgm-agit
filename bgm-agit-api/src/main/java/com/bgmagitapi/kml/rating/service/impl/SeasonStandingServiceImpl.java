package com.bgmagitapi.kml.rating.service.impl;

import com.bgmagitapi.kml.rating.domain.Ratings;
import com.bgmagitapi.kml.rating.domain.Tiers;
import com.bgmagitapi.kml.rating.dto.MemberStandingRankResponse;
import com.bgmagitapi.kml.rating.dto.MemberStandingResponse;
import com.bgmagitapi.kml.rating.dto.SeasonStandingRow;
import com.bgmagitapi.kml.rating.entity.Rating;
import com.bgmagitapi.kml.rating.entity.Season;
import com.bgmagitapi.kml.rating.entity.SeasonStanding;
import com.bgmagitapi.kml.rating.entity.Tier;
import com.bgmagitapi.kml.rating.exception.SeasonStandingNotFoundException;
import com.bgmagitapi.kml.rating.repository.RatingRepository;
import com.bgmagitapi.kml.rating.repository.SeasonStandingRepository;
import com.bgmagitapi.kml.rating.repository.TierRepository;
import com.bgmagitapi.kml.rating.service.SeasonService;
import com.bgmagitapi.kml.rating.service.SeasonStandingService;
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

import static com.bgmagitapi.origin.util.MathUtils.*;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SeasonStandingServiceImpl implements SeasonStandingService {

    private final SeasonService seasonService;

    private final BgmAgitMemberRepository memberRepository;
    private final TierRepository tierRepository;
    private final SeasonStandingRepository seasonStandingRepository;
    private final RatingRepository ratingRepository;


    @Override
    public MemberStandingResponse getMemberCurrentStanding(Long memberId) {
        /**
         * 진행중인 시즌 우선, 진행중인 시즌 없으면 가장 마지막에 종료된 시즌
         */
        Season season = seasonService.getOngoingSeason()
                .orElseGet(seasonService::getLastClosedSeason);

        return getMemberStanding(season.getId(), memberId);
    }

    @Override
    public MemberStandingResponse getMemberStanding(Long seasonId, Long memberId) {
        Season season = seasonService.getSeason(seasonId);

        Tiers tiers = new Tiers(tierRepository.findBySeasonIdOrderByMinRatingDesc(seasonId));

        BgmAgitMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("사용자가 존재하지 않습니다. memberId=" + memberId));

        SeasonStanding seasonStanding = seasonStandingRepository.findBySeasonIdAndMemberId(seasonId, memberId)
                .orElseThrow(() -> new SeasonStandingNotFoundException("순위 정보를 찾을 수 없습니다."));

        Tier tier = tiers.getTierBy(seasonStanding.getRating());
        Optional<Tier> nextTier = tiers.getNextTier(tier);

        Ratings ratings = new Ratings(ratingRepository.findByMemberId(memberId));
        Optional<Rating> seasonHigh = ratings.getSeasonHigh();
        Optional<Rating> seasonLow = ratings.getSeasonLow();
        List<Rating> recentRatings = ratings.getRecent(5);

        int seasonRank = seasonStandingRepository.findRank(seasonId, memberId);

        return MemberStandingResponse.builder()
                .seasonId(seasonId)
                .seasonName(season.getName())
                .memberId(memberId)
                .memberName(member.getBgmAgitMemberName())
                .rating(seasonStanding.getRating())
                .gameCount(ratings.size())
                .seasonRank(seasonRank)
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
}
