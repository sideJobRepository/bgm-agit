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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.kml.matchs.entity.QMatchs.matchs;
import static com.bgmagitapi.kml.record.entity.QRecord.record;

@RequiredArgsConstructor
public class RecordRepositoryImpl implements RecordQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public Page<Record> findByRecords(Pageable pageable) {
        //  Match 먼저 페이징
        List<Long> matchIds = queryFactory
                .select(matchs.id)
                .from(matchs)
                .where(matchs.delStatus.eq("N"))
                .orderBy(matchs.registDate.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        if (matchIds.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        // 해당 Match에 속한 Record 전부 조회
        List<Record> records = queryFactory
                .selectFrom(record)
                .join(record.matchs, matchs).fetchJoin()
                .join(record.member, bgmAgitMember).fetchJoin()
                .where(matchs.id.in(matchIds))
                .fetch();

        // Match 기준 count
        JPAQuery<Long> countQuery = queryFactory
                .select(matchs.count())
                .from(matchs)
                .where(matchs.delStatus.eq("N"));
        
        return PageableExecutionUtils.getPage(records,pageable,countQuery::fetchOne);
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
