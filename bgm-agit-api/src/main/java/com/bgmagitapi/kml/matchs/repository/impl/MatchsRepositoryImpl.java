package com.bgmagitapi.kml.matchs.repository.impl;

import com.bgmagitapi.kml.matchs.repository.query.MatchsQueryRepository;
import com.bgmagitapi.kml.years.dto.response.YearRankGetResponse;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Ops;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.kml.matchs.entity.QMatchs.matchs;
import static com.bgmagitapi.kml.record.entity.QRecord.record;

@RequiredArgsConstructor
public class MatchsRepositoryImpl implements MatchsQueryRepository {

    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<Integer> getMatchsYears() {
        return queryFactory
                .select(matchs.registDate.year()).distinct()
                .from(matchs)
                .orderBy(matchs.registDate.year().desc())
                .fetch();
    }
    
    @Override
    public YearRankGetResponse getYearRanks(Integer year) {
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        LocalDateTime from = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime to = LocalDate.of(year + 1, 1, 1).atStartOfDay();
        
        // 1) 규정국수 계산: "올해 참가자 전체"의 (개인별 국수 평균) * 0.3, 최대 300
        List<Long> gamesPerMember = queryFactory
                .select(record.count())
                .from(matchs)
                .join(record).on(record.matchs.eq(matchs))
                .where(
                        matchs.delStatus.eq("N"),
                        matchs.registDate.goe(from),
                        matchs.registDate.lt(to)
                )
                .groupBy(record.member.bgmAgitMemberId)
                .fetch();
        
        double avgGames = gamesPerMember.stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);
        
        int requiredGames = (int) Math.ceil(avgGames * 0.3);
        if (requiredGames > 300) requiredGames = 300;
        
        // 2) 연간 랭킹 집계
        NumberExpression<Long> matchCountExpr = record.count();
        NumberExpression<Double> pointSumExpr = Expressions.numberOperation(Double.class, Ops.AggOps.SUM_AGG, record.recordPoint);
        
        NumberExpression<Long> firstCountExpr = sumCase(record.recordRank.eq(1));
        NumberExpression<Long> secondCountExpr = sumCase(record.recordRank.eq(2));
        NumberExpression<Long> thirdCountExpr = sumCase(record.recordRank.eq(3));
        NumberExpression<Long> fourthCountExpr = sumCase(record.recordRank.eq(4));
        
        List<Tuple> rows = queryFactory
                .select(
                        record.member.bgmAgitMemberId,
                        bgmAgitMember.bgmAgitMemberNickname,
                        pointSumExpr,
                        matchCountExpr,
                        firstCountExpr,
                        secondCountExpr,
                        thirdCountExpr,
                        fourthCountExpr
                )
                .from(matchs)
                .join(record).on(record.matchs.eq(matchs))
                .join(record.member, bgmAgitMember)
                .where(
                        matchs.delStatus.eq("N"),
                        matchs.registDate.goe(from),
                        matchs.registDate.lt(to)
                )
                .groupBy(record.member.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname)
                .having(matchCountExpr.goe((long) requiredGames))
                .orderBy(
                        pointSumExpr.desc(),
                        matchCountExpr.desc(),
                        record.member.bgmAgitMemberId.asc()
                )
                .fetch();
        
        // 3) DTO 매핑 + 순위 부여
        List<YearRankGetResponse.Ranking> rankings = new ArrayList<>();
        int rank = 1;
        
        for (Tuple t : rows) {
            Long memberId = t.get(record.member.bgmAgitMemberId);
            String nickname = t.get(bgmAgitMember.bgmAgitMemberNickname);
            Double point = t.get(pointSumExpr);
            Long matchCount = t.get(matchCountExpr);
            
            Long first = t.get(firstCountExpr);
            Long second = t.get(secondCountExpr);
            Long third = t.get(thirdCountExpr);
            Long fourth = t.get(fourthCountExpr);
            
            rankings.add(
                    YearRankGetResponse.Ranking.builder()
                            .rank(rank++)
                            .memberId(memberId)
                            .nickname(nickname)
                            .point(point == null ? 0.0 : Math.round(point * 10.0) / 10.0)
                            .matchCount(matchCount == null ? 0 : matchCount.intValue())
                            .firstCount(first == null ? 0L : first)
                            .secondCount(second == null ? 0L : second)
                            .thirdCount(third == null ? 0L : third)
                            .fourthCount(fourth == null ? 0L : fourth)
                            .build()
            );
        }
        
        return YearRankGetResponse.builder()
                .year(year)
                .requiredGames(requiredGames)
                .rankings(rankings)
                .build();
    }
    
    // SUM(CASE WHEN cond THEN 1 ELSE 0 END)
    private NumberExpression<Long> sumCase(BooleanExpression cond) {
        return Expressions.numberOperation(Long.class, Ops.AggOps.SUM_AGG, new CaseBuilder().when(cond).then(1L).otherwise(0L));
    }
}
