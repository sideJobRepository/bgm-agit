package com.bgmagitapi.kml.rating.repository.impl;

import com.bgmagitapi.kml.rating.dto.SeasonStandingRow;
import com.bgmagitapi.kml.rating.repository.query.SeasonStandingQueryRepository;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.ArrayList;
import java.util.List;

import static com.bgmagitapi.kml.matchs.entity.QMatchs.matchs;
import static com.bgmagitapi.kml.rating.entity.QRating.rating;
import static com.bgmagitapi.kml.rating.entity.QSeasonStanding.seasonStanding;
import static com.bgmagitapi.kml.record.entity.QRecord.record;
import static com.bgmagitapi.origin.entity.QBgmAgitMember.bgmAgitMember;

@RequiredArgsConstructor
public class SeasonStandingRepositoryImpl implements SeasonStandingQueryRepository {

    private final JPAQueryFactory queryFactory;

    /**
     * 특정 시즌 전체 회원의 랭킹 목록 (레이팅 내림차순, 페이징).
     * SeasonStanding(레이팅) 기준으로 구동하고, 해당 시즌의 Rating→Record를 left join 하여
     * 판수/평균순위/1위·4위 카운트를 집계한다. 아직 판을 치지 않은 회원도 판수 0으로 노출된다.
     */
    @Override
    public Page<SeasonStandingRow> findStandings(Long seasonId, Pageable pageable) {

        NumberExpression<Integer> firstFlag = new CaseBuilder()
                .when(record.recordRank.eq(1)).then(1).otherwise(0);
        NumberExpression<Integer> fourthFlag = new CaseBuilder()
                .when(record.recordRank.eq(4)).then(1).otherwise(0);

        NumberExpression<Long> firstSum = Expressions.numberTemplate(Long.class, "SUM({0})", firstFlag);
        NumberExpression<Long> fourthSum = Expressions.numberTemplate(Long.class, "SUM({0})", fourthFlag);
        NumberExpression<Double> avgRank = Expressions.numberTemplate(Double.class, "AVG({0})", record.recordRank);

        List<Tuple> rows = queryFactory
                .select(
                        bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMember.bgmAgitMemberNickname,
                        seasonStanding.rating,
                        record.count(),
                        avgRank,
                        firstSum,
                        fourthSum
                )
                .from(seasonStanding)
                .join(bgmAgitMember).on(seasonStanding.member.bgmAgitMemberId.eq(bgmAgitMember.bgmAgitMemberId))
                .leftJoin(rating).on(rating.member.bgmAgitMemberId.eq(seasonStanding.member.bgmAgitMemberId)
                        .and(rating.season.id.eq(seasonStanding.season.id)))
                .leftJoin(matchs).on(matchs.id.eq(rating.matchs.id).and(matchs.delStatus.eq("N")))
                .leftJoin(record).on(record.matchs.id.eq(matchs.id)
                        .and(record.member.bgmAgitMemberId.eq(seasonStanding.member.bgmAgitMemberId)))
                .where(seasonStanding.season.id.eq(seasonId))
                .groupBy(bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname, seasonStanding.rating)
                .orderBy(seasonStanding.rating.desc(), bgmAgitMember.bgmAgitMemberId.asc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        List<SeasonStandingRow> content = new ArrayList<>();
        for (Tuple t : rows) {
            content.add(new SeasonStandingRow(
                    t.get(bgmAgitMember.bgmAgitMemberId),
                    t.get(bgmAgitMember.bgmAgitMemberNickname),
                    t.get(seasonStanding.rating),
                    nz(t.get(record.count())),
                    t.get(avgRank),
                    nz(t.get(firstSum)),
                    nz(t.get(fourthSum))
            ));
        }

        JPAQuery<Long> countQuery = queryFactory
                .select(seasonStanding.member.bgmAgitMemberId.countDistinct())
                .from(seasonStanding)
                .where(seasonStanding.season.id.eq(seasonId));

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    private static long nz(Long v) {
        return v == null ? 0L : v;
    }
}
