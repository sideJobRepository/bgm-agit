package com.bgmagitapi.kml.rank.repository;

import com.bgmagitapi.kml.matchs.entity.QMatchs;
import com.bgmagitapi.kml.rank.dto.response.RankGetResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitMember.*;
import static com.bgmagitapi.kml.matchs.entity.QMatchs.*;
import static com.bgmagitapi.kml.record.entity.QRecord.*;

@Repository
@RequiredArgsConstructor
public class RankRepository {

    private final JPAQueryFactory queryFactory;
    
    public Page<RankGetResponse> findRanks(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        
        // ===== 기존 Expression 그대로 유지 =====
        NumberExpression<Integer> tobiCount =
                Expressions.numberTemplate(
                        Integer.class,
                        "SUM(CASE WHEN {0} < 0 THEN 1 ELSE 0 END)",
                        record.recordScore
                );
        
        NumberExpression<Integer> tobiMinus3Count =
                Expressions.numberTemplate(
                        Integer.class,
                        "SUM(CASE WHEN {0} < 0 AND {1} >= 3 THEN 1 ELSE 0 END)",
                        record.recordScore,
                        record.recordRank
                );
        
        NumberExpression<Integer> plusCount =
                Expressions.numberTemplate(
                        Integer.class,
                        "SUM(CASE WHEN {0} > 0 THEN 1 ELSE 0 END)",
                        record.recordPoint
                );
        
        NumberExpression<Integer> minus2Count =
                Expressions.numberTemplate(
                        Integer.class,
                        "SUM(CASE WHEN {0} >= 3 THEN 1 ELSE 0 END)",
                        record.recordRank
                );
        
        NumberExpression<Integer> plus3Count =
                Expressions.numberTemplate(
                        Integer.class,
                        "SUM(CASE WHEN {0} <= 3 THEN 1 ELSE 0 END)",
                        record.recordRank
                );
        
        NumberExpression<Double> totalPoint =
                Expressions.numberTemplate(
                        Double.class,
                        "ROUND(SUM({0}), 2)",
                        record.recordPoint
                );
        
        NumberExpression<Integer> firstCount =
                Expressions.numberTemplate(
                        Integer.class,
                        "SUM(CASE WHEN {0} = 1 THEN 1 ELSE 0 END)",
                        record.recordRank
                );
        
        NumberExpression<Integer> secondCount =
                Expressions.numberTemplate(
                        Integer.class,
                        "SUM(CASE WHEN {0} = 2 THEN 1 ELSE 0 END)",
                        record.recordRank
                );
        
        NumberExpression<Integer> thirdCount =
                Expressions.numberTemplate(
                        Integer.class,
                        "SUM(CASE WHEN {0} = 3 THEN 1 ELSE 0 END)",
                        record.recordRank
                );
        
        NumberExpression<Integer> fourthCount =
                Expressions.numberTemplate(
                        Integer.class,
                        "SUM(CASE WHEN {0} = 4 THEN 1 ELSE 0 END)",
                        record.recordRank
                );
        // ===== 데이터 조회 =====
        List<RankGetResponse> content = queryFactory
                .select(Projections.constructor(
                        RankGetResponse.class,
                        bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMember.bgmAgitMemberNickname,
                        totalPoint,
                        record.count().intValue(),
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
                .where(betweenDate(start, end));
        
        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }
    
    private BooleanExpression betweenDate(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return null;
        }

        return record.registDate.goe(start)
                .and(record.registDate.lt(end));
    }
}
