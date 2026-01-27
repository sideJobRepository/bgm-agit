package com.bgmagitapi.kml.record.repository.impl;

import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.record.repository.query.RecordQueryRepository;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitMember.*;
import static com.bgmagitapi.kml.matchs.entity.QMatchs.*;
import static com.bgmagitapi.kml.record.entity.QRecord.*;

@RequiredArgsConstructor
public class RecordRepositoryImpl implements RecordQueryRepository {

    private final JPAQueryFactory queryFactory;
    
    @Override
    public Page<Record> findByRecords(Pageable pageable) {
        List<Record> result = queryFactory
                .selectFrom(record)
                .join(record.matchs, matchs).fetchJoin()
                .join(record.member, bgmAgitMember).fetchJoin()
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .fetch();
        
        JPAQuery<Long> countQuery = queryFactory
                .select(matchs.count())
                .from(matchs);
        
        return PageableExecutionUtils.getPage(result,pageable,countQuery::fetchOne);
    }
}
