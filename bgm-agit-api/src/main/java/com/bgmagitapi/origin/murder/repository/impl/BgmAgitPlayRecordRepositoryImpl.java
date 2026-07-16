package com.bgmagitapi.origin.murder.repository.impl;

import com.bgmagitapi.origin.murder.dto.response.ExperiencedMemberResponse;
import com.bgmagitapi.origin.murder.dto.response.MemberMonthlyBucketResponse;
import com.bgmagitapi.origin.murder.dto.response.MemberMonthlyCountResponse;
import com.bgmagitapi.origin.murder.dto.response.MemberPlayHistoryResponse;
import com.bgmagitapi.origin.murder.dto.response.QExperiencedMemberResponse;
import com.bgmagitapi.origin.murder.dto.response.QMemberMonthlyBucketResponse;
import com.bgmagitapi.origin.murder.dto.response.QMemberMonthlyCountResponse;
import com.bgmagitapi.origin.murder.dto.response.QMemberPlayHistoryResponse;
import com.bgmagitapi.origin.murder.entity.BgmAgitPlayRecord;
import com.bgmagitapi.origin.murder.entity.BgmAgitPlayRecordParticipant;
import com.bgmagitapi.origin.murder.repository.query.PlayStatsQueryRepository;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.time.LocalDate;
import java.util.List;

import static com.bgmagitapi.origin.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.origin.murder.entity.QBgmAgitMurderGame.bgmAgitMurderGame;
import static com.bgmagitapi.origin.murder.entity.QBgmAgitPlayRecord.bgmAgitPlayRecord;
import static com.bgmagitapi.origin.murder.entity.QBgmAgitPlayRecordParticipant.bgmAgitPlayRecordParticipant;

@RequiredArgsConstructor
public class BgmAgitPlayRecordRepositoryImpl implements PlayStatsQueryRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<BgmAgitPlayRecord> findPlayRecords(Pageable pageable, Long gameId, Long memberId, Integer year, Integer month) {
        LocalDate start = rangeStart(year, month);
        LocalDate end = rangeEnd(year, month);

        // 1. 세션 ID 페이징
        List<Long> ids = queryFactory
                .select(bgmAgitPlayRecord.id)
                .from(bgmAgitPlayRecord)
                .where(
                        gameEq(gameId),
                        dateGoe(start),
                        dateLt(end),
                        participatedBy(memberId)
                )
                .orderBy(bgmAgitPlayRecord.playDate.desc(), bgmAgitPlayRecord.id.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        if (ids.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        // 2. 세션 본문 (게임/작성자 fetch join)
        List<BgmAgitPlayRecord> content = queryFactory
                .selectFrom(bgmAgitPlayRecord)
                .join(bgmAgitPlayRecord.murderGame, bgmAgitMurderGame).fetchJoin()
                .join(bgmAgitPlayRecord.bgmAgitMember, bgmAgitMember).fetchJoin()
                .where(bgmAgitPlayRecord.id.in(ids))
                .orderBy(bgmAgitPlayRecord.playDate.desc(), bgmAgitPlayRecord.id.desc())
                .fetch();

        // 3. count
        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitPlayRecord.count())
                .from(bgmAgitPlayRecord)
                .where(
                        gameEq(gameId),
                        dateGoe(start),
                        dateLt(end),
                        participatedBy(memberId)
                );

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    @Override
    public List<BgmAgitPlayRecordParticipant> findParticipantsByRecordIds(List<Long> recordIds) {
        if (recordIds == null || recordIds.isEmpty()) {
            return List.of();
        }
        return queryFactory
                .selectFrom(bgmAgitPlayRecordParticipant)
                .join(bgmAgitPlayRecordParticipant.bgmAgitMember, bgmAgitMember).fetchJoin()
                .where(bgmAgitPlayRecordParticipant.playRecord.id.in(recordIds))
                .orderBy(bgmAgitPlayRecordParticipant.id.asc())
                .fetch();
    }

    @Override
    public List<MemberMonthlyCountResponse> findMonthlyCounts(LocalDate startInclusive, LocalDate endExclusive) {
        NumberExpression<Long> playCount = Expressions.numberTemplate(Long.class, "COUNT({0})", bgmAgitPlayRecord.id);
        return queryFactory
                .select(new QMemberMonthlyCountResponse(
                        bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMember.bgmAgitMemberNickname,
                        playCount))
                .from(bgmAgitPlayRecordParticipant)
                .join(bgmAgitPlayRecordParticipant.playRecord, bgmAgitPlayRecord)
                .join(bgmAgitPlayRecordParticipant.bgmAgitMember, bgmAgitMember)
                .where(
                        bgmAgitPlayRecord.playDate.goe(startInclusive),
                        bgmAgitPlayRecord.playDate.lt(endExclusive)
                )
                .groupBy(bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname)
                .orderBy(playCount.desc(), bgmAgitMember.bgmAgitMemberNickname.asc())
                .fetch();
    }

    @Override
    public long countSessions(LocalDate startInclusive, LocalDate endExclusive) {
        Long c = queryFactory
                .select(bgmAgitPlayRecord.count())
                .from(bgmAgitPlayRecord)
                .where(
                        bgmAgitPlayRecord.playDate.goe(startInclusive),
                        bgmAgitPlayRecord.playDate.lt(endExclusive)
                )
                .fetchOne();
        return c != null ? c : 0L;
    }

    @Override
    public long countMemberSessions(Long memberId, LocalDate startInclusive, LocalDate endExclusive) {
        Long c = queryFactory
                .select(bgmAgitPlayRecordParticipant.count())
                .from(bgmAgitPlayRecordParticipant)
                .join(bgmAgitPlayRecordParticipant.playRecord, bgmAgitPlayRecord)
                .where(
                        bgmAgitPlayRecordParticipant.bgmAgitMember.bgmAgitMemberId.eq(memberId),
                        bgmAgitPlayRecord.playDate.goe(startInclusive),
                        bgmAgitPlayRecord.playDate.lt(endExclusive)
                )
                .fetchOne();
        return c != null ? c : 0L;
    }

    @Override
    public List<MemberPlayHistoryResponse> findMemberGameHistory(Long memberId) {
        NumberExpression<Long> playCount = Expressions.numberTemplate(Long.class, "COUNT({0})", bgmAgitPlayRecord.id);
        var lastDate = Expressions.dateTemplate(LocalDate.class, "MAX({0})", bgmAgitPlayRecord.playDate);
        return queryFactory
                .select(new QMemberPlayHistoryResponse(
                        bgmAgitMurderGame.id,
                        bgmAgitMurderGame.name,
                        bgmAgitMurderGame.imageUrl,
                        playCount,
                        lastDate))
                .from(bgmAgitPlayRecordParticipant)
                .join(bgmAgitPlayRecordParticipant.playRecord, bgmAgitPlayRecord)
                .join(bgmAgitPlayRecord.murderGame, bgmAgitMurderGame)
                .where(bgmAgitPlayRecordParticipant.bgmAgitMember.bgmAgitMemberId.eq(memberId))
                .groupBy(bgmAgitMurderGame.id, bgmAgitMurderGame.name, bgmAgitMurderGame.imageUrl)
                .orderBy(lastDate.desc())
                .fetch();
    }

    @Override
    public List<MemberMonthlyBucketResponse> findMemberMonthlyBuckets(Long memberId) {
        StringExpression ym = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m')", bgmAgitPlayRecord.playDate);
        NumberExpression<Long> playCount = Expressions.numberTemplate(Long.class, "COUNT({0})", bgmAgitPlayRecord.id);
        return queryFactory
                .select(new QMemberMonthlyBucketResponse(ym, playCount))
                .from(bgmAgitPlayRecordParticipant)
                .join(bgmAgitPlayRecordParticipant.playRecord, bgmAgitPlayRecord)
                .where(bgmAgitPlayRecordParticipant.bgmAgitMember.bgmAgitMemberId.eq(memberId))
                .groupBy(ym)
                .orderBy(ym.desc())
                .fetch();
    }

    @Override
    public List<ExperiencedMemberResponse> findExperiencedMembers(Long gameId, List<Long> memberIds, Long excludeRecordId) {
        if (gameId == null || memberIds == null || memberIds.isEmpty()) {
            return List.of();
        }
        NumberExpression<Long> playCount = Expressions.numberTemplate(Long.class, "COUNT({0})", bgmAgitPlayRecord.id);
        var lastDate = Expressions.dateTemplate(LocalDate.class, "MAX({0})", bgmAgitPlayRecord.playDate);
        return queryFactory
                .select(new QExperiencedMemberResponse(
                        bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMember.bgmAgitMemberNickname,
                        playCount,
                        lastDate))
                .from(bgmAgitPlayRecordParticipant)
                .join(bgmAgitPlayRecordParticipant.playRecord, bgmAgitPlayRecord)
                .join(bgmAgitPlayRecordParticipant.bgmAgitMember, bgmAgitMember)
                .where(
                        bgmAgitPlayRecord.murderGame.id.eq(gameId),
                        bgmAgitMember.bgmAgitMemberId.in(memberIds),
                        excludeRecordId != null ? bgmAgitPlayRecord.id.ne(excludeRecordId) : null
                )
                .groupBy(bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname)
                .fetch();
    }

    // =========================== helpers ===========================

    private BooleanExpression gameEq(Long gameId) {
        return gameId != null ? bgmAgitPlayRecord.murderGame.id.eq(gameId) : null;
    }

    private BooleanExpression dateGoe(LocalDate start) {
        return start != null ? bgmAgitPlayRecord.playDate.goe(start) : null;
    }

    private BooleanExpression dateLt(LocalDate end) {
        return end != null ? bgmAgitPlayRecord.playDate.lt(end) : null;
    }

    private BooleanExpression participatedBy(Long memberId) {
        if (memberId == null) return null;
        return JPAExpressions.selectOne()
                .from(bgmAgitPlayRecordParticipant)
                .where(
                        bgmAgitPlayRecordParticipant.playRecord.eq(bgmAgitPlayRecord),
                        bgmAgitPlayRecordParticipant.bgmAgitMember.bgmAgitMemberId.eq(memberId)
                )
                .exists();
    }

    private LocalDate rangeStart(Integer year, Integer month) {
        if (year == null) return null;
        if (month != null) return LocalDate.of(year, month, 1);
        return LocalDate.of(year, 1, 1);
    }

    private LocalDate rangeEnd(Integer year, Integer month) {
        if (year == null) return null;
        if (month != null) return LocalDate.of(year, month, 1).plusMonths(1);
        return LocalDate.of(year + 1, 1, 1);
    }
}
