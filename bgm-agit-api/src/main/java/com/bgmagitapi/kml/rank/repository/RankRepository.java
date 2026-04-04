package com.bgmagitapi.kml.rank.repository;

import com.bgmagitapi.kml.rank.dto.response.RankGetResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
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
        
        
        NumberExpression<Double> totalPoint = Expressions.numberTemplate(Double.class, "ROUND(SUM({0}), 2)", record.recordPoint);
        
        return queryFactory
                .select(Projections.constructor(
                        RankGetResponse.class,
                        bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMember.bgmAgitMemberNickname,
                        totalPoint,
                        record.count().intValue()
                ))
                .from(record)
                .join(bgmAgitMember)
                .on(record.member.bgmAgitMemberId.eq(bgmAgitMember.bgmAgitMemberId))
                .where(betweenDate(start,end))
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
