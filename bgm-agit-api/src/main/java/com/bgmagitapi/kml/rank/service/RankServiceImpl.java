package com.bgmagitapi.kml.rank.service;


import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.kml.rank.dto.response.MemberRecentGameResponse;
import com.bgmagitapi.kml.rank.dto.response.MemberStatsResponse;
import com.bgmagitapi.kml.rank.dto.response.RankGetResponse;
import com.bgmagitapi.kml.rank.enums.RankType;
import com.bgmagitapi.kml.rank.repository.RankRepository;
import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.record.repository.RecordRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RequiredArgsConstructor
@Transactional(readOnly = true)
@Service
public class RankServiceImpl {

    private final RankRepository rankRepository;
    private final RecordRepository recordRepository;
    private final BgmAgitMemberRepository memberRepository;

    public Page<RankGetResponse> findRanks(RankType type,
                                           LocalDate baseDate,
                                           Integer year,
                                           Integer month,
                                           LocalDateTime startDateTime,
                                           LocalDateTime endDateTime,
                                           Pageable pageable) {

        LocalDateTime start;
        LocalDateTime end;

        if (type == RankType.ALL) {
            start = null;
            end = null;
        } else if (type == RankType.WEEKLY) {
            if (baseDate == null) {
                throw new IllegalArgumentException("주간 조회에는 baseDate가 필요합니다.");
            }
            LocalDate monday = baseDate.with(DayOfWeek.MONDAY);
            start = monday.atStartOfDay();
            end = monday.plusWeeks(1).atStartOfDay();
        } else if (type == RankType.MONTHLY) {
            if (year == null || month == null) {
                throw new IllegalArgumentException("월간 조회에는 year, month가 필요합니다.");
            }
            LocalDate firstOfMonth = LocalDate.of(year, month, 1);
            start = firstOfMonth.atStartOfDay();
            end = firstOfMonth.plusMonths(1).atStartOfDay();
        } else {
            if (startDateTime == null || endDateTime == null) {
                throw new IllegalArgumentException("사용자 설정에는 시작/종료 일시가 필요합니다.");
            }
            if (!endDateTime.isAfter(startDateTime)) {
                throw new IllegalArgumentException("종료 일시는 시작 일시보다 이후여야 합니다.");
            }
            start = startDateTime;
            end = endDateTime;
        }

        Page<RankGetResponse> ranks = rankRepository.findRanks(start, end, pageable);

        List<RankGetResponse> content = ranks.getContent();

        for (int i = 0; i < content.size(); i++) {

            RankGetResponse r = content.get(i);
            double total = r.getTotalCount() != null ? r.getTotalCount() : 0.0;

            if (total == 0.0) continue;

            int rank = (int) pageable.getOffset() + i + 1;
            r.setRank(rank);

            r.setFirstRate(round((r.getFirstCount() * 100.0) / total));
            r.setTop2Rate(round(((r.getFirstCount() + r.getSecondCount()) * 100.0) / total));
            r.setFourthRate(round((r.getFourthCount() * 100.0) / total));
            r.setPlusRate(round((r.getPlusCount() * 100.0) / total));
            r.setMinus2Rate(round((r.getMinus2Count() * 100.0) / total));
            r.setPlus3Rate(round((r.getPlus3Count() * 100.0) / total));
            r.setTobiRate(round((r.getTobiCount() * 100.0) / total));
            r.setTobiMinus3Rate(round((r.getTobiMinus3Count() * 100.0) / total));

            double avgRank =
                    (r.getFirstCount() * 1.0 +
                            r.getSecondCount() * 2.0 +
                            r.getThirdCount() * 3.0 +
                            r.getFourthCount() * 4.0) / total;

            r.setAvgRank(round(avgRank));
        }

        return ranks;
    }

    private double round(double value) {
        return Math.round(value * 10) / 10.0;
    }

    // ==================== 개인기록 ====================

    public MemberStatsResponse findMemberStats(Long memberId, Integer year) {
        LocalDateTime[] range = yearRange(year);
        LocalDateTime start = range[0];
        LocalDateTime end = range[1];

        String nickname = memberRepository.findById(memberId)
                .map(BgmAgitMember::getBgmAgitMemberNickname)
                .orElse(null);

        return MemberStatsResponse.builder()
                .memberId(memberId)
                .memberNickname(nickname)
                .cards(rankRepository.findMemberCards(memberId, start, end))
                .seatStats(rankRepository.findMemberSeatStats(memberId, start, end))
                .topRivals(rankRepository.findMemberTopRivals(memberId, start, end, 3))
                .build();
    }

    public Page<MemberRecentGameResponse> findMemberRecentGames(Long memberId, Integer year, Pageable pageable) {
        LocalDateTime[] range = yearRange(year);
        LocalDateTime start = range[0];
        LocalDateTime end = range[1];

        Page<Long> matchIdsPage = rankRepository.findMemberMatchIds(memberId, start, end, pageable);
        List<Long> matchIds = matchIdsPage.getContent();
        if (matchIds.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, matchIdsPage.getTotalElements());
        }

        List<Record> records = recordRepository.findRecordsByMatchIds(matchIds);

        Map<Long, List<Record>> byMatch = new LinkedHashMap<>();
        for (Long mid : matchIds) byMatch.put(mid, new ArrayList<>());
        for (Record r : records) {
            byMatch.computeIfAbsent(r.getMatchs().getId(), k -> new ArrayList<>()).add(r);
        }

        List<MemberRecentGameResponse> content = new ArrayList<>();
        for (Long mid : matchIds) {
            List<Record> group = byMatch.get(mid);
            if (group == null || group.isEmpty()) continue;
            group.sort(Comparator.comparingInt(rec -> rec.getRecordRank() == null ? 99 : rec.getRecordRank()));

            Record me = group.stream()
                    .filter(rec -> rec.getMember() != null
                            && memberId.equals(rec.getMember().getBgmAgitMemberId()))
                    .findFirst()
                    .orElse(null);
            if (me == null) continue;

            List<MemberRecentGameResponse.Player> players = new ArrayList<>();
            for (Record rec : group) {
                players.add(MemberRecentGameResponse.Player.builder()
                        .memberId(rec.getMember() == null ? null : rec.getMember().getBgmAgitMemberId())
                        .memberNickname(rec.getMember() == null ? null : rec.getMember().getBgmAgitMemberNickname())
                        .seat(rec.getRecordSeat() == null ? null : rec.getRecordSeat().name())
                        .rank(rec.getRecordRank())
                        .score(rec.getRecordScore())
                        .build());
            }

            content.add(MemberRecentGameResponse.builder()
                    .matchsId(mid)
                    .registDate(me.getRegistDate())
                    .matchsWind(me.getMatchs().getWind() == null ? null : me.getMatchs().getWind().name())
                    .mySeat(me.getRecordSeat() == null ? null : me.getRecordSeat().name())
                    .myRank(me.getRecordRank())
                    .myScore(me.getRecordScore())
                    .myPoint(me.getRecordPoint())
                    .players(players)
                    .build());
        }

        return new PageImpl<>(content, pageable, matchIdsPage.getTotalElements());
    }

    private LocalDateTime[] yearRange(Integer year) {
        if (year == null) {
            return new LocalDateTime[]{null, null};
        }
        LocalDateTime start = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime end = LocalDate.of(year + 1, 1, 1).atStartOfDay();
        return new LocalDateTime[]{start, end};
    }
}
