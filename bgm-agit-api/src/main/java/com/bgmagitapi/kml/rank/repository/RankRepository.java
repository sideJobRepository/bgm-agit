package com.bgmagitapi.kml.rank.repository;

import com.bgmagitapi.kml.rank.dto.response.RankGetResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitMember.*;
import static com.bgmagitapi.kml.record.entity.QRecord.*;

@Repository
@RequiredArgsConstructor
public class RankRepository {

    private final JPAQueryFactory queryFactory;
    
    public List<RankGetResponse> findRanks(LocalDate start, LocalDate end){
        
        // ===== 토비 =====
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

// ===== 플러스 ===== (정산 점수 기준)
        NumberExpression<Integer> plusCount =
                Expressions.numberTemplate(
                        Integer.class,
                        "SUM(CASE WHEN {0} > 0 THEN 1 ELSE 0 END)",
                        record.recordPoint
                );

// ===== -2 ===== (3~4등)
        NumberExpression<Integer> minus2Count =
                Expressions.numberTemplate(
                        Integer.class,
                        "SUM(CASE WHEN {0} >= 3 THEN 1 ELSE 0 END)",
                        record.recordRank
                );

// ===== +3 ===== (1~3등)
        NumberExpression<Integer> plus3Count =
                Expressions.numberTemplate(
                        Integer.class,
                        "SUM(CASE WHEN {0} <= 3 THEN 1 ELSE 0 END)",
                        record.recordRank
                );

// ===== 총점 =====
        NumberExpression<Double> totalPoint =
                Expressions.numberTemplate(
                        Double.class,
                        "ROUND(SUM({0}), 2)",
                        record.recordPoint
                );

// ===== 순위 카운트 =====
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
        
        return queryFactory
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
                .where(betweenDate(start, end))
                .groupBy(bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname)
                .orderBy(totalPoint.desc())
                .fetch();
        
        
    }
    
    private BooleanExpression betweenDate(LocalDate start, LocalDate end) {
        if(start == null || end == null){
            return null;
        }
        return record.registDate.goe(start.atStartOfDay())
                .and(record.registDate.lt(end.plusDays(1).atStartOfDay()));
    }
}
