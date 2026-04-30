package com.bgmagitapi.kml.rank.repository;

import com.bgmagitapi.kml.matchs.entity.QMatchs;
import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.rank.dto.response.RankGetResponse;
import com.bgmagitapi.kml.record.entity.QRecord;
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
}
