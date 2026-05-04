package com.bgmagitapi.kml.rank.repository;

import com.bgmagitapi.kml.matchs.entity.QMatchs;
import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.rank.dto.response.MemberStatsResponse;
import com.bgmagitapi.kml.rank.dto.response.RankGetResponse;
import com.bgmagitapi.kml.record.entity.QRecord;
import com.bgmagitapi.kml.record.enums.Wind;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.bgmagitapi.entity.QBgmAgitMember.*;
import static com.bgmagitapi.kml.matchs.entity.QMatchs.*;
import static com.bgmagitapi.kml.record.entity.QRecord.*;

@Repository
@RequiredArgsConstructor
public class RankRepository {

    private final JPAQueryFactory queryFactory;
    
    public Page<RankGetResponse> findRanks(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        
        // 같은 매치의 4위 행을 가리키는 서브쿼리용 alias
        QRecord recordSub = new QRecord("recordSub");

        // 같은 매치에서 4위가 토비(score < 0)인지
        BooleanExpression fourthIsTobi = JPAExpressions.selectOne()
                .from(recordSub)
                .where(recordSub.matchs.id.eq(record.matchs.id),
                        recordSub.recordRank.eq(4),
                        recordSub.recordScore.lt(0))
                .exists();

        // 국수 가중치: 동장 0.5 / 남장(반장) 1 / 서장 1.5 / 전장 2
        NumberExpression<Double> weight = new CaseBuilder()
                .when(matchs.wind.eq(MatchsWind.EAST)).then(0.5)
                .when(matchs.wind.eq(MatchsWind.SOUTH)).then(1.0)
                .when(matchs.wind.eq(MatchsWind.WEST)).then(1.5)
                .when(matchs.wind.eq(MatchsWind.NORTH)).then(2.0)
                .otherwise(0.0);

        NumberExpression<Integer> tobiFlag = new CaseBuilder()
                .when(record.recordScore.lt(0)).then(1).otherwise(0);
        NumberExpression<Integer> tobiMinus3Flag = new CaseBuilder()
                .when(record.recordRank.eq(3).and(fourthIsTobi)).then(1).otherwise(0);
        NumberExpression<Integer> plusFlag = new CaseBuilder()
                .when(record.recordScore.goe(30000)).then(1).otherwise(0);
        NumberExpression<Integer> minus2Flag = new CaseBuilder()
                .when(record.recordRank.eq(2).and(record.recordScore.lt(30000))).then(1).otherwise(0);
        NumberExpression<Integer> plus3Flag = new CaseBuilder()
                .when(record.recordRank.eq(3).and(record.recordScore.goe(30000))).then(1).otherwise(0);
        NumberExpression<Integer> firstFlag = new CaseBuilder()
                .when(record.recordRank.eq(1)).then(1).otherwise(0);
        NumberExpression<Integer> secondFlag = new CaseBuilder()
                .when(record.recordRank.eq(2)).then(1).otherwise(0);
        NumberExpression<Integer> thirdFlag = new CaseBuilder()
                .when(record.recordRank.eq(3)).then(1).otherwise(0);
        NumberExpression<Integer> fourthFlag = new CaseBuilder()
                .when(record.recordRank.eq(4)).then(1).otherwise(0);

        NumberExpression<Double> totalCount = Expressions.numberTemplate(
                Double.class, "SUM({0})", weight);

        NumberExpression<Double> tobiCount = Expressions.numberTemplate(
                Double.class, "SUM({0} * {1})", weight, tobiFlag);

        NumberExpression<Double> tobiMinus3Count = Expressions.numberTemplate(
                Double.class, "SUM({0} * {1})", weight, tobiMinus3Flag);

        NumberExpression<Double> plusCount = Expressions.numberTemplate(
                Double.class, "SUM({0} * {1})", weight, plusFlag);

        NumberExpression<Double> minus2Count = Expressions.numberTemplate(
                Double.class, "SUM({0} * {1})", weight, minus2Flag);

        NumberExpression<Double> plus3Count = Expressions.numberTemplate(
                Double.class, "SUM({0} * {1})", weight, plus3Flag);

        NumberExpression<Double> totalPoint = Expressions.numberTemplate(
                Double.class, "ROUND(SUM({0}), 2)", record.recordPoint);

        NumberExpression<Double> firstCount = Expressions.numberTemplate(
                Double.class, "SUM({0} * {1})", weight, firstFlag);

        NumberExpression<Double> secondCount = Expressions.numberTemplate(
                Double.class, "SUM({0} * {1})", weight, secondFlag);

        NumberExpression<Double> thirdCount = Expressions.numberTemplate(
                Double.class, "SUM({0} * {1})", weight, thirdFlag);

        NumberExpression<Double> fourthCount = Expressions.numberTemplate(
                Double.class, "SUM({0} * {1})", weight, fourthFlag);
        // ===== 데이터 조회 =====
        List<RankGetResponse> content = queryFactory
                .select(Projections.constructor(
                        RankGetResponse.class,
                        bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMember.bgmAgitMemberNickname,
                        totalPoint,
                        totalCount,
                        firstCount,
                        secondCount,
                        thirdCount,
                        fourthCount,
                        plusCount,
                        minus2Count,
                        plus3Count,
                        tobiCount,
                        tobiMinus3Count
                ))
                .from(record)
                .join(bgmAgitMember)
                .on(record.member.bgmAgitMemberId.eq(bgmAgitMember.bgmAgitMemberId))
                .join(matchs)
                .on(record.matchs.id.eq(matchs.id))
                .where(betweenDate(start, end) , matchs.delStatus.eq("N"))
                .groupBy(bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname)
                .orderBy(totalPoint.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();
        
        // ===== count 쿼리 =====
        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitMember.bgmAgitMemberId.countDistinct())
                .from(record)
                .join(bgmAgitMember)
                .on(record.member.bgmAgitMemberId.eq(bgmAgitMember.bgmAgitMemberId))
                .join(matchs)
                .on(record.matchs.id.eq(matchs.id))
                .where(betweenDate(start, end), matchs.delStatus.eq("N"));
        
        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }
    
    private BooleanExpression betweenDate(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return null;
        }

        return record.registDate.goe(start)
                .and(record.registDate.lt(end));
    }

    // ==================== 개인기록 (memberId) ====================

    public MemberStatsResponse.Cards findMemberCards(Long memberId, LocalDateTime start, LocalDateTime end) {

        NumberExpression<Integer> firstFlag = new CaseBuilder()
                .when(record.recordRank.eq(1)).then(1).otherwise(0);
        NumberExpression<Integer> fourthFlag = new CaseBuilder()
                .when(record.recordRank.eq(4)).then(1).otherwise(0);
        NumberExpression<Integer> tobiFlag = new CaseBuilder()
                .when(record.recordScore.lt(0)).then(1).otherwise(0);
        NumberExpression<Integer> plusFlag = new CaseBuilder()
                .when(record.recordScore.goe(30000)).then(1).otherwise(0);
        NumberExpression<Integer> minus2Flag = new CaseBuilder()
                .when(record.recordRank.eq(2).and(record.recordScore.lt(30000))).then(1).otherwise(0);

        NumberExpression<Long> firstSum = Expressions.numberTemplate(Long.class, "SUM({0})", firstFlag);
        NumberExpression<Long> fourthSum = Expressions.numberTemplate(Long.class, "SUM({0})", fourthFlag);
        NumberExpression<Long> tobiSum = Expressions.numberTemplate(Long.class, "SUM({0})", tobiFlag);
        NumberExpression<Long> plusSum = Expressions.numberTemplate(Long.class, "SUM({0})", plusFlag);
        NumberExpression<Long> minus2Sum = Expressions.numberTemplate(Long.class, "SUM({0})", minus2Flag);
        NumberExpression<Double> pointSum = Expressions.numberTemplate(Double.class, "SUM({0})", record.recordPoint);
        NumberExpression<Double> rankAvg = Expressions.numberTemplate(Double.class, "AVG({0})", record.recordRank);

        Tuple row = queryFactory
                .select(
                        record.count(),
                        rankAvg,
                        firstSum,
                        fourthSum,
                        tobiSum,
                        plusSum,
                        minus2Sum,
                        pointSum
                )
                .from(record)
                .join(matchs).on(record.matchs.id.eq(matchs.id))
                .where(
                        record.member.bgmAgitMemberId.eq(memberId),
                        matchs.delStatus.eq("N"),
                        betweenDate(start, end)
                )
                .fetchOne();

        if (row == null || row.get(0, Long.class) == null) {
            return MemberStatsResponse.Cards.builder().build();
        }

        long total = nz(row.get(0, Long.class));
        if (total == 0L) {
            return MemberStatsResponse.Cards.builder().build();
        }
        Double avgRank = row.get(1, Double.class);
        long firstCount = nz(row.get(2, Long.class));
        long fourthCount = nz(row.get(3, Long.class));
        long tobiCount = nz(row.get(4, Long.class));
        long plusCount = nz(row.get(5, Long.class));
        long minus2Count = nz(row.get(6, Long.class));
        Double sumPoint = row.get(7, Double.class);

        return MemberStatsResponse.Cards.builder()
                .totalCount(total)
                .avgRank(round(avgRank == null ? 0.0 : avgRank))
                .firstCount(firstCount)
                .firstRate(rate(firstCount, total))
                .fourthCount(fourthCount)
                .fourthRate(rate(fourthCount, total))
                .tobiCount(tobiCount)
                .tobiRate(rate(tobiCount, total))
                .plusCount(plusCount)
                .plusRate(rate(plusCount, total))
                .minus2Count(minus2Count)
                .minus2Rate(rate(minus2Count, total))
                .sumPoint(sumPoint == null ? 0.0 : Math.round(sumPoint * 100) / 100.0)
                .build();
    }

    public List<MemberStatsResponse.SeatRankBlock> findMemberSeatStats(Long memberId, LocalDateTime start, LocalDateTime end) {

        NumberExpression<Integer> tobiFlag = new CaseBuilder()
                .when(record.recordScore.lt(0)).then(1).otherwise(0);
        NumberExpression<Long> tobiSum = Expressions.numberTemplate(Long.class, "SUM({0})", tobiFlag);

        // wind, recordSeat, recordRank별 카운트 + 토비 카운트
        List<Tuple> rows = queryFactory
                .select(
                        matchs.wind,
                        record.recordSeat,
                        record.recordRank,
                        record.count(),
                        tobiSum
                )
                .from(record)
                .join(matchs).on(record.matchs.id.eq(matchs.id))
                .where(
                        record.member.bgmAgitMemberId.eq(memberId),
                        matchs.delStatus.eq("N"),
                        betweenDate(start, end)
                )
                .groupBy(matchs.wind, record.recordSeat, record.recordRank)
                .fetch();

        // wind별 (rank → seat → count) 누적
        Map<MatchsWind, long[][]> rankBySeat = new HashMap<>();
        Map<MatchsWind, long[]> tobiBySeat = new HashMap<>();
        Map<MatchsWind, Long> totalGames = new HashMap<>();

        for (Tuple t : rows) {
            MatchsWind w = t.get(0, MatchsWind.class);
            Wind seat = t.get(1, Wind.class);
            Integer rank = t.get(2, Integer.class);
            long cnt = nz(t.get(3, Long.class));
            long tobi = nz(t.get(4, Long.class));
            if (w == null || seat == null || rank == null) continue;

            int seatIdx = seat.ordinal();
            int rankIdx = Math.max(0, Math.min(3, rank - 1));

            rankBySeat.computeIfAbsent(w, k -> new long[4][4])[rankIdx][seatIdx] += cnt;
            tobiBySeat.computeIfAbsent(w, k -> new long[4])[seatIdx] += tobi;
            totalGames.merge(w, cnt, Long::sum);
        }

        List<MemberStatsResponse.SeatRankBlock> result = new ArrayList<>();
        for (MatchsWind w : new MatchsWind[]{MatchsWind.EAST, MatchsWind.SOUTH, MatchsWind.WEST, MatchsWind.NORTH}) {
            long total = totalGames.getOrDefault(w, 0L);
            if (total == 0L) continue;

            long[][] mat = rankBySeat.getOrDefault(w, new long[4][4]);
            long[] tobi = tobiBySeat.getOrDefault(w, new long[4]);

            List<MemberStatsResponse.SeatRankRow> srRows = new ArrayList<>();
            for (int r = 0; r < 4; r++) {
                long all = mat[r][0] + mat[r][1] + mat[r][2] + mat[r][3];
                srRows.add(MemberStatsResponse.SeatRankRow.builder()
                        .label(String.valueOf(r + 1))
                        .all(all)
                        .east(mat[r][0])
                        .south(mat[r][1])
                        .west(mat[r][2])
                        .north(mat[r][3])
                        .build());
            }
            long allTobi = tobi[0] + tobi[1] + tobi[2] + tobi[3];
            srRows.add(MemberStatsResponse.SeatRankRow.builder()
                    .label("토비")
                    .all(allTobi)
                    .east(tobi[0])
                    .south(tobi[1])
                    .west(tobi[2])
                    .north(tobi[3])
                    .build());

            result.add(MemberStatsResponse.SeatRankBlock.builder()
                    .wind(w.name())
                    .totalGames(total)
                    .rows(srRows)
                    .build());
        }
        return result;
    }

    public List<MemberStatsResponse.TopRival> findMemberTopRivals(Long memberId, LocalDateTime start, LocalDateTime end, int limit) {

        QRecord other = new QRecord("other");

        BooleanExpression dateRange = (start == null || end == null)
                ? null
                : record.registDate.goe(start).and(record.registDate.lt(end));

        return queryFactory
                .select(Projections.constructor(
                        MemberStatsResponse.TopRival.class,
                        bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMember.bgmAgitMemberNickname,
                        other.count()
                ))
                .from(record)
                .join(matchs).on(record.matchs.id.eq(matchs.id))
                .join(other).on(other.matchs.id.eq(matchs.id)
                        .and(other.member.bgmAgitMemberId.ne(memberId)))
                .join(bgmAgitMember).on(other.member.bgmAgitMemberId.eq(bgmAgitMember.bgmAgitMemberId))
                .where(
                        record.member.bgmAgitMemberId.eq(memberId),
                        matchs.delStatus.eq("N"),
                        dateRange
                )
                .groupBy(bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname)
                .orderBy(other.count().desc())
                .limit(limit)
                .fetch();
    }

    public Page<Long> findMemberMatchIds(Long memberId, LocalDateTime start, LocalDateTime end, Pageable pageable) {

        BooleanExpression dateRange = (start == null || end == null)
                ? null
                : record.registDate.goe(start).and(record.registDate.lt(end));

        List<Long> ids = queryFactory
                .select(record.matchs.id)
                .from(record)
                .join(matchs).on(record.matchs.id.eq(matchs.id))
                .where(
                        record.member.bgmAgitMemberId.eq(memberId),
                        matchs.delStatus.eq("N"),
                        dateRange
                )
                .orderBy(record.registDate.desc(), record.matchs.id.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        if (ids.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        JPAQuery<Long> countQuery = queryFactory
                .select(record.count())
                .from(record)
                .join(matchs).on(record.matchs.id.eq(matchs.id))
                .where(
                        record.member.bgmAgitMemberId.eq(memberId),
                        matchs.delStatus.eq("N"),
                        dateRange
                );

        return PageableExecutionUtils.getPage(ids, pageable, countQuery::fetchOne);
    }

    private static long nz(Long v) {
        return v == null ? 0L : v;
    }

    private static double rate(long count, long total) {
        if (total <= 0) return 0.0;
        return Math.round((count * 100.0 / total) * 10) / 10.0;
    }

    private static double round(double v) {
        return Math.round(v * 10) / 10.0;
    }
}
