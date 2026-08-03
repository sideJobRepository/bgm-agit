package com.bgmagitapi.kml.rating.service.impl;

import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.matchs.repository.MatchsRepository;
import com.bgmagitapi.kml.rating.domain.RatingCalculator;
import com.bgmagitapi.kml.rating.domain.RatingEntry;
import com.bgmagitapi.kml.rating.domain.RatingResult;
import com.bgmagitapi.kml.rating.entity.Rating;
import com.bgmagitapi.kml.rating.entity.Season;
import com.bgmagitapi.kml.rating.entity.SeasonStanding;
import com.bgmagitapi.kml.rating.enums.SeasonProgressStatus;
import com.bgmagitapi.kml.rating.exception.InvalidRecordRankException;
import com.bgmagitapi.kml.rating.exception.MatchsNotFoundException;
import com.bgmagitapi.kml.rating.exception.MultipleOngoingSeasonException;
import com.bgmagitapi.kml.rating.exception.SeasonNotFoundException;
import com.bgmagitapi.kml.rating.repository.RatingRepository;
import com.bgmagitapi.kml.rating.repository.SeasonRepository;
import com.bgmagitapi.kml.rating.repository.SeasonStandingRepository;
import com.bgmagitapi.kml.rating.service.RatingService;
import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.record.repository.RecordRepository;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final MatchsRepository matchsRepository;
    private final RecordRepository recordRepository;
    private final SeasonRepository seasonRepository;
    private final SeasonStandingRepository seasonStandingRepository;
    private final RatingRepository ratingRepository;

    // TODO
    //   - 운영 DB, staging DB 에 테이블 추가 및 season 정보 추가
    @Override
    @Transactional
    public void process(Long matchsId) {
        Matchs matchs = matchsRepository.findById(matchsId)
                .orElseThrow(() -> new MatchsNotFoundException("match 정보가 존재하지 않습니다. matchsId=" + matchsId));

        Season season = loadOngoingSeason();
        Map<Integer, Record> recordByRank = recordRepository.findRecordsByMatchsId(matchsId)
                .stream()
                .collect(Collectors.toUnmodifiableMap(
                        Record::getRecordRank,
                        r -> r
                ));

        List<BgmAgitMember> members = recordByRank.values().stream()
                .map(Record::getMember)
                .toList();
        Map<Long, SeasonStanding> seasonStandingMap = loadSeasonStandingOrDefault(season, members);

        // 이번 판 적용 전 레이팅으로 4명의 델타를 한 번에 계산
        RatingCalculator ratingCalculator = new RatingCalculator(season);
        RatingResult ratingResult = ratingCalculator.calculate(
                toRatingEntry(recordByRank, seasonStandingMap, matchsId, 1),
                toRatingEntry(recordByRank, seasonStandingMap, matchsId, 2),
                toRatingEntry(recordByRank, seasonStandingMap, matchsId, 3),
                toRatingEntry(recordByRank, seasonStandingMap, matchsId, 4),
                matchs.getWind());

        List<Rating> ratings = new ArrayList<>();
        List<SeasonStanding> seasonStandings = new ArrayList<>();

        for (int rank = 1; rank <= 4; rank++) {
            Record record = requireRank(recordByRank, matchsId, rank);
            BgmAgitMember member = record.getMember();

            SeasonStanding seasonStanding = seasonStandingMap.get(member.getBgmAgitMemberId());
            BigDecimal delta = ratingResult.getByRank(rank).ratingValue();
            seasonStanding.addRatingValue(delta);
            Rating rating = Rating.create(season, matchs, member, delta, seasonStanding.getRating());

            ratings.add(rating);
            seasonStandings.add(seasonStanding);
        }

        ratingRepository.saveAll(ratings);
        seasonStandingRepository.saveAll(seasonStandings);
    }

    private RatingEntry toRatingEntry(Map<Integer, Record> recordByRank, Map<Long, SeasonStanding> seasonStandingMap, Long matchsId, int rank) {
        Record record = requireRank(recordByRank, matchsId, rank);
        SeasonStanding seasonStanding = seasonStandingMap.get(record.getMember().getBgmAgitMemberId());
        return new RatingEntry(record, seasonStanding.getRating());
    }

    private Season loadOngoingSeason() {
        List<Season> ongoingSeasons = seasonRepository.findAllByProgressStatus(SeasonProgressStatus.ONGOING);

        if(ongoingSeasons.size() > 1)
            throw new MultipleOngoingSeasonException();

        return ongoingSeasons
                .stream()
                .findFirst()
                .orElseThrow(() -> new SeasonNotFoundException("진행중인 시즌을 찾을 수 없습니다."));
    }

    private Map<Long, SeasonStanding> loadSeasonStandingOrDefault(Season season, List<BgmAgitMember> members) {
        List<Long> memberIds = members.stream().map(BgmAgitMember::getBgmAgitMemberId).toList();

        List<SeasonStanding> seasonStandings = seasonStandingRepository.findBySeasonIdAndMemberBgmAgitMemberIdIn(season.getId(), memberIds);

        Map<Long, SeasonStanding> seasonStandingMap = seasonStandings.stream()
                .collect(Collectors.toMap(
                        s -> s.getMember().getBgmAgitMemberId(),
                        s -> s)
                );

        for (BgmAgitMember member : members) {
            seasonStandingMap.putIfAbsent(member.getBgmAgitMemberId(), SeasonStanding.create(season, member));
        }

        return seasonStandingMap;
    }

    private Record requireRank(Map<Integer, Record> byRank, Long matchsId, int rank) {
        Record record = byRank.get(rank);
        if (record == null) {
            throw new InvalidRecordRankException(rank + "등 기록이 없습니다. matchsId = " + matchsId);
        }
        return record;
    }
}
