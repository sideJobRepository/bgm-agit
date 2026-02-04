package com.bgmagitapi.kml.record.repository.impl;

import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.record.dto.response.QRecordGetDetailResponse_RecordList;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
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
                .where(matchs.delStatus.eq("N"))
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .fetch();
        
        JPAQuery<Long> countQuery = queryFactory
                .select(matchs.count())
                .from(matchs);
        
        return PageableExecutionUtils.getPage(result, pageable, countQuery::fetchOne);
    }
    
    @Override
    public Matchs findByMatchs(Long id) {
        return queryFactory
                .selectFrom(matchs)
                .where(matchs.id.eq(id))
                .fetchOne();
    }
    
    @Override
    public List<RecordGetDetailResponse.RecordList> findByRecord(Long id) {
        return queryFactory
                .select(
                        new QRecordGetDetailResponse_RecordList(
                                record.id,
                                bgmAgitMember.bgmAgitMemberId,
                                bgmAgitMember.bgmAgitMemberNickname,
                                record.recordScore,
                                record.recordSeat
                        )
                )
                .from(record)
                .join(record.member, bgmAgitMember)
                .where(record.matchs.id.eq(id))
                .fetch();
    }
    
    @Override
    public List<Record> findByRecordByMatchsId(Long id) {
        return queryFactory
                .selectFrom(record)
                .where(record.matchs.id.eq(id))
                .fetch();
    }
}
