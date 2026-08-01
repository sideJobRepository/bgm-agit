package com.bgmagitapi.kml.rating.service.impl;

import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.matchs.repository.MatchsRepository;
import com.bgmagitapi.kml.rating.entity.Season;
import com.bgmagitapi.kml.rating.entity.SeasonStanding;
import com.bgmagitapi.kml.rating.enums.SeasonProgressStatus;
import com.bgmagitapi.kml.rating.exception.InvalidRecordRankException;
import com.bgmagitapi.kml.rating.exception.MatchsNotFoundException;
import com.bgmagitapi.kml.rating.exception.SeasonNotFoundException;
import com.bgmagitapi.kml.rating.repository.SeasonRepository;
import com.bgmagitapi.kml.rating.repository.SeasonStandingRepository;
import com.bgmagitapi.kml.rating.service.RatingService;
import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.record.repository.RecordRepository;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final MatchsRepository matchsRepository;
    private final RecordRepository recordRepository;
    private final SeasonRepository seasonRepository;
    private final SeasonStandingRepository seasonStandingRepository;

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

        Record first  = requireRank(recordByRank, matchsId, 1);
        Record second = requireRank(recordByRank, matchsId, 2);
        Record third  = requireRank(recordByRank, matchsId, 3);
        Record fourth = requireRank(recordByRank, matchsId, 4);

        List<BgmAgitMember> members = recordByRank.values().stream()
                .map(Record::getMember)
                .toList();

        Map<Long, SeasonStanding> seasonStandingMap = loadSeasonStandingOrDefault(season, members);

        // TODO
        //   - rating 저장 (ratingValue, ratingResult 가 뭔지 확인하고)
        //   - rating 별 가중치 정해지면 수정 (대국별 가중치는 적용함)
        SeasonStanding firstSeasonStanding = seasonStandingMap.get(first.getMember().getBgmAgitMemberId());
        SeasonStanding secondStanding = seasonStandingMap.get(second.getMember().getBgmAgitMemberId());
        SeasonStanding thirdSeasonStanding = seasonStandingMap.get(third.getMember().getBgmAgitMemberId());
        SeasonStanding fourthSeasonStanding = seasonStandingMap.get(fourth.getMember().getBgmAgitMemberId());

        firstSeasonStanding.addRatingValue(matchs.getWind(), season.getFirstScore());
        secondStanding.addRatingValue(matchs.getWind(), season.getSecondScore());
        thirdSeasonStanding.addRatingValue(matchs.getWind(), season.getThirdScore());
        fourthSeasonStanding.addRatingValue(matchs.getWind(), season.getFourthScore());

        // 저장
        seasonStandingRepository.saveAll(List.of(
                firstSeasonStanding, secondStanding, thirdSeasonStanding, fourthSeasonStanding
        ));
    }

    private Season loadOngoingSeason() {
        return seasonRepository.findByProgressStatus(SeasonProgressStatus.ONGOING)
                .orElseThrow(() -> new SeasonNotFoundException("진행중인 시즌이 없습니다."));
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
            seasonStandingMap.putIfAbsent(member.getBgmAgitMemberId(), SeasonStanding.create(season,member));
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
