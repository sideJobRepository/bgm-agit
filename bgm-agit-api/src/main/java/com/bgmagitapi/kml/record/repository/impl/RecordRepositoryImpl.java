package com.bgmagitapi.kml.record.repository.impl;

import com.bgmagitapi.kml.record.dto.response.QRecordGetDetailResponse_RecordList;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.record.repository.query.RecordQueryRepository;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.kml.matchs.entity.QMatchs.matchs;
import static com.bgmagitapi.kml.record.entity.QRecord.record;

@RequiredArgsConstructor
public class RecordRepositoryImpl implements RecordQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public Page<Record> findByRecords(Pageable pageable, String startDate, String endDate, String nickName) {
        //  Match 먼저 페이징
        List<Long> matchIds = queryFactory
                .select(matchs.id)
                .from(matchs)
                .where(
                        matchs.delStatus.eq("N"),
                        whereDateGoe(startDate),
                        whereDateLt(endDate),
                        whereNickLikeExists(nickName)
                )
                .orderBy(matchs.registDate.desc(), matchs.id.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();
        
        if (matchIds.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }
        
        // 2) 해당 Match에 속한 Record 전부 조회 (여기서 페이징/닉네임 필터 X)
        List<Record> records = queryFactory
                .selectFrom(record)
                .join(record.matchs, matchs).fetchJoin()
                .join(record.member, bgmAgitMember).fetchJoin()
                .where(
                        matchs.id.in(matchIds)
                        // record.delStatus.eq("N") // record에도 삭제여부 있으면 추가
                )
                .orderBy(matchs.registDate.desc(), matchs.id.desc(), record.id.asc())
                .fetch();
        
        // 3) count도 Match 기준 + 동일 조건
        JPAQuery<Long> countQuery = queryFactory
                .select(matchs.count())
                .from(matchs)
                .where(
                        matchs.delStatus.eq("N"),
                        whereDateGoe(startDate),
                        whereDateLt(endDate),
                        whereNickLikeExists(nickName)
                );
        return PageableExecutionUtils.getPage(records, pageable, countQuery::fetchOne);
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
    
    @Override
    public Page<Long> findMatchIdsByYear(Pageable pageable, Integer year) {
        if (year == null) year = LocalDate.now().getYear();
        
        LocalDateTime from = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime to   = LocalDate.of(year + 1, 1, 1).atStartOfDay();
        
        List<Long> ids = queryFactory
                .select(matchs.id)
                .from(matchs)
                .where(
                        matchs.registDate.goe(from),
                        matchs.registDate.lt(to)
                )
                .orderBy(matchs.registDate.desc(), matchs.id.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();
        
        if (ids.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }
        
        JPAQuery<Long> countQuery = queryFactory
                .select(matchs.count())
                .from(matchs)
                .where(
                        matchs.registDate.goe(from),
                        matchs.registDate.lt(to)
                );
        
        return PageableExecutionUtils.getPage(ids, pageable, countQuery::fetchOne);
    }
    
    @Override
    public List<Record> findRecordsByMatchIds(List<Long> matchIds) {
        return queryFactory
                .selectFrom(record)
                .join(record.matchs, matchs).fetchJoin()
                .join(record.member, bgmAgitMember).fetchJoin()
                .where(matchs.id.in(matchIds))
                .fetch();
    }
    
    private BooleanExpression whereDateGoe(String startDate) {
        if (!StringUtils.hasText(startDate)) {
            return null;
        }
        LocalDate s = LocalDate.parse(startDate);
        return matchs.registDate.goe(s.atStartOfDay());
    }
    private BooleanExpression whereDateLt(String endDate) {
        if (!StringUtils.hasText(endDate)) {
            return null;
        }
        LocalDate e = LocalDate.parse(endDate);
        return matchs.registDate.lt(e.plusDays(1).atStartOfDay());
    }
    private BooleanExpression whereNickLikeExists(String nickName) {
        if (!StringUtils.hasText(nickName)) return null;
        
        return JPAExpressions.selectOne()
                .from(record)
                .join(record.member, bgmAgitMember)
                .where(
                        record.matchs.eq(matchs),
                        bgmAgitMember.bgmAgitMemberNickname.like("%" + nickName + "%")
                )
                .exists();
    }
}
