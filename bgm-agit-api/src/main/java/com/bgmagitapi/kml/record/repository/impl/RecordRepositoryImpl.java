package com.bgmagitapi.kml.record.repository.impl;

import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.kml.record.dto.response.QRecordGetDetailResponse_RecordList;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.record.repository.query.RecordQueryRepository;
import com.bgmagitapi.kml.yakamantype.dto.response.MembersGetResponse;
import com.querydsl.core.Tuple;
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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.bgmagitapi.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.kml.matchs.entity.QMatchs.matchs;
import static com.bgmagitapi.kml.record.entity.QRecord.record;
import static com.bgmagitapi.kml.sanbaeman.entity.QSanbaeman.sanbaeman;
import static com.bgmagitapi.kml.yakuman.entity.QYakuman.yakuman;

@RequiredArgsConstructor
public class RecordRepositoryImpl implements RecordQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public Page<Record> findByRecords(Pageable pageable, String startDate, String endDate, String nickName, String tournamentStatus, String bonusType, boolean includeDeleted) {
        //  Match 먼저 페이징
        // 1. match 기준으로 페이징
        List<Long> matchIds = queryFactory
                .select(matchs.id)
                .from(matchs)
                .where(
                        whereDelStatus(includeDeleted),
                        whereDateGoe(startDate),
                        whereDateLt(endDate),
                        whereNickLikeExists(nickName),
                        whereTournamentStatus(tournamentStatus),
                        whereBonusType(bonusType)
                )
                .orderBy(matchs.registDate.desc(), matchs.id.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        if (matchIds.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        // 2. 해당 match의 record 전체 조회 (페이징 X)
        List<Record> content = queryFactory
                .selectFrom(record)
                .join(record.matchs, matchs).fetchJoin()
                .join(record.member, bgmAgitMember).fetchJoin()
                .where(
                        matchs.id.in(matchIds)
                )
                .orderBy(matchs.registDate.desc(), matchs.id.desc(), record.id.asc())
                .fetch();

        // 3. count (match 기준!)
        JPAQuery<Long> countQuery = queryFactory
                .select(matchs.count())
                .from(matchs)
                .where(
                        whereDelStatus(includeDeleted),
                        whereDateGoe(startDate),
                        whereDateLt(endDate),
                        whereNickLikeExists(nickName),
                        whereTournamentStatus(tournamentStatus),
                        whereBonusType(bonusType)
                );
        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    private com.querydsl.core.types.dsl.BooleanExpression whereDelStatus(boolean includeDeleted) {
        return includeDeleted ? null : matchs.delStatus.eq("N");
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
                                record.recordSeat,
                                record.recordRank,
                                record.recordPoint
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
    public Long countQuery(String startDate, String endDate, String nickName, String tournamentStatus, String bonusType, boolean includeDeleted){
     return queryFactory
                .select(matchs.count())
                .from(matchs)
                .where(
                        whereDelStatus(includeDeleted),
                        whereDateGoe(startDate),
                        whereDateLt(endDate),
                        whereNickLikeExists(nickName),
                        whereTournamentStatus(tournamentStatus),
                        whereBonusType(bonusType)
                )
             .fetchOne();
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
    public List<MembersGetResponse> findRecentMembers(int limit) {
        // 집계(GROUP BY MAX) 대신, 최근 기록순으로 넉넉히 가져와 메모리에서 dedup.
        // (QueryDSL 집계 메서드 컴파일 함정 회피 — 기존 record.registDate.desc() 패턴 재사용)
        int window = Math.max(limit * 20, 400);
        List<Tuple> rows = queryFactory
                .select(bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname)
                .from(record)
                .join(record.matchs, matchs)
                .join(record.member, bgmAgitMember)
                .where(
                        matchs.delStatus.eq("N"),
                        bgmAgitMember.socialType.eq(BgmAgitSocialType.MAHJONG)
                )
                .orderBy(record.registDate.desc(), record.id.desc())
                .limit(window)
                .fetch();

        Map<Long, MembersGetResponse> dedup = new LinkedHashMap<>();
        for (Tuple row : rows) {
            Long id = row.get(bgmAgitMember.bgmAgitMemberId);
            if (id == null || dedup.containsKey(id)) {
                continue;
            }
            dedup.put(id, MembersGetResponse.builder()
                    .id(id)
                    .nickName(row.get(bgmAgitMember.bgmAgitMemberNickname))
                    .build());
            if (dedup.size() >= limit) {
                break;
            }
        }
        return new ArrayList<>(dedup.values());
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
    private BooleanExpression whereTournamentStatus(String tournamentStatus) {
        if (!StringUtils.hasText(tournamentStatus)) return null;
        return matchs.tournamentStatus.eq(tournamentStatus);
    }

    // 역만/삼배만 화료가 있는 대국만 필터 (YAKUMAN / SANBAEMAN, 그 외/빈값은 전체)
    private BooleanExpression whereBonusType(String bonusType) {
        if (!StringUtils.hasText(bonusType)) return null;
        if ("YAKUMAN".equals(bonusType)) {
            return JPAExpressions.selectOne()
                    .from(yakuman)
                    .where(yakuman.matchs.eq(matchs))
                    .exists();
        }
        if ("SANBAEMAN".equals(bonusType)) {
            return JPAExpressions.selectOne()
                    .from(sanbaeman)
                    .where(sanbaeman.matchs.eq(matchs))
                    .exists();
        }
        return null;
    }
}
