package com.bgmagitapi.kml.tournament.repository;

import com.bgmagitapi.kml.tournament.dto.response.TournamentLeaderboardResponse;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.bgmagitapi.origin.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.kml.matchs.entity.QMatchs.matchs;
import static com.bgmagitapi.kml.record.entity.QRecord.record;

@Repository
@RequiredArgsConstructor
public class TournamentLeaderboardRepository {

    private final JPAQueryFactory queryFactory;

    public List<TournamentLeaderboardResponse.Entry> findLeaderboard(Long tournamentId) {

        NumberExpression<Long> firstFlag =
                new CaseBuilder().when(record.recordRank.eq(1)).then(1L).otherwise(0L);
        NumberExpression<Long> fourthFlag =
                new CaseBuilder().when(record.recordRank.eq(4)).then(1L).otherwise(0L);

        NumberExpression<Double> totalPoint =
                Expressions.numberTemplate(Double.class, "COALESCE(SUM({0}), 0)", record.recordPoint);
        NumberExpression<Double> avgRank =
                Expressions.numberTemplate(Double.class, "AVG({0})", record.recordRank);
        NumberExpression<Long> firstSum =
                Expressions.numberTemplate(Long.class, "SUM({0})", firstFlag);
        NumberExpression<Long> fourthSum =
                Expressions.numberTemplate(Long.class, "SUM({0})", fourthFlag);

        List<Tuple> rows = queryFactory
                .select(
                        bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMember.bgmAgitMemberNickname,
                        record.count(),
                        totalPoint,
                        avgRank,
                        firstSum,
                        fourthSum
                )
                .from(record)
                .join(record.matchs, matchs)
                .join(record.member, bgmAgitMember)
                .where(
                        matchs.tournament.id.eq(tournamentId),
                        matchs.delStatus.eq("N")
                )
                .groupBy(bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname)
                .orderBy(totalPoint.desc())
                .fetch();

        return rows.stream()
                .map(row -> TournamentLeaderboardResponse.Entry.builder()
                        .memberId(row.get(bgmAgitMember.bgmAgitMemberId))
                        .nickName(row.get(bgmAgitMember.bgmAgitMemberNickname))
                        .gameCount(row.get(record.count()))
                        .totalPoint(roundOrZero(row.get(totalPoint), 1))
                        .avgRank(roundOrZero(row.get(avgRank), 2))
                        .firstCount(row.get(firstSum))
                        .fourthCount(row.get(fourthSum))
                        .build())
                .toList();
    }

    private static Double roundOrZero(Double value, int scale) {
        if (value == null) return 0.0;
        double pow = Math.pow(10, scale);
        return Math.round(value * pow) / pow;
    }
}
