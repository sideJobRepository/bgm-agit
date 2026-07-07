package com.bgmagitapi.origin.clocktower.repository.impl;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerParticipant;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerRecord;
import com.bgmagitapi.origin.clocktower.repository.query.ClockTowerStatsQueryRepository;
import com.bgmagitapi.origin.murder.dto.response.MemberMonthlyBucketResponse;
import com.bgmagitapi.origin.murder.dto.response.MemberMonthlyCountResponse;
import com.bgmagitapi.origin.murder.dto.response.MemberPlayHistoryResponse;
import com.bgmagitapi.origin.murder.dto.response.QMemberMonthlyBucketResponse;
import com.bgmagitapi.origin.murder.dto.response.QMemberMonthlyCountResponse;
import com.bgmagitapi.origin.murder.dto.response.QMemberPlayHistoryResponse;
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

import static com.bgmagitapi.origin.clocktower.entity.QBgmAgitClockTowerGame.bgmAgitClockTowerGame;
import static com.bgmagitapi.origin.clocktower.entity.QBgmAgitClockTowerParticipant.bgmAgitClockTowerParticipant;
import static com.bgmagitapi.origin.clocktower.entity.QBgmAgitClockTowerRecord.bgmAgitClockTowerRecord;
import static com.bgmagitapi.origin.entity.QBgmAgitMember.bgmAgitMember;

@RequiredArgsConstructor
public class BgmAgitClockTowerRecordRepositoryImpl implements ClockTowerStatsQueryRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<BgmAgitClockTowerRecord> findRecords(Pageable pageable, Long gameId, Long memberId, Integer year, Integer month,
                                                     Long viewerId, boolean isAdmin) {
        LocalDate start = rangeStart(year, month);
        LocalDate end = rangeEnd(year, month);
        BooleanExpression visible = statusVisible(viewerId, isAdmin);

        List<Long> ids = queryFactory
                .select(bgmAgitClockTowerRecord.id)
                .from(bgmAgitClockTowerRecord)
                .where(gameEq(gameId), dateGoe(start), dateLt(end), participatedBy(memberId), visible)
                .orderBy(bgmAgitClockTowerRecord.playDate.desc(), bgmAgitClockTowerRecord.id.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        if (ids.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        List<BgmAgitClockTowerRecord> content = queryFactory
                .selectFrom(bgmAgitClockTowerRecord)
                .join(bgmAgitClockTowerRecord.game, bgmAgitClockTowerGame).fetchJoin()
                .join(bgmAgitClockTowerRecord.bgmAgitMember, bgmAgitMember).fetchJoin()
                .where(bgmAgitClockTowerRecord.id.in(ids))
                .orderBy(bgmAgitClockTowerRecord.playDate.desc(), bgmAgitClockTowerRecord.id.desc())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitClockTowerRecord.count())
                .from(bgmAgitClockTowerRecord)
                .where(gameEq(gameId), dateGoe(start), dateLt(end), participatedBy(memberId), visible);

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    @Override
    public List<BgmAgitClockTowerParticipant> findParticipantsByRecordIds(List<Long> recordIds) {
        if (recordIds == null || recordIds.isEmpty()) {
            return List.of();
        }
        return queryFactory
                .selectFrom(bgmAgitClockTowerParticipant)
                .join(bgmAgitClockTowerParticipant.bgmAgitMember, bgmAgitMember).fetchJoin()
                .where(bgmAgitClockTowerParticipant.record.id.in(recordIds))
                .orderBy(bgmAgitClockTowerParticipant.id.asc())
                .fetch();
    }

    @Override
    public List<MemberMonthlyCountResponse> findMonthlyCounts(LocalDate startInclusive, LocalDate endExclusive) {
        NumberExpression<Long> playCount = Expressions.numberTemplate(Long.class, "COUNT({0})", bgmAgitClockTowerRecord.id);
        return queryFactory
                .select(new QMemberMonthlyCountResponse(
                        bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMember.bgmAgitMemberNickname,
                        playCount))
                .from(bgmAgitClockTowerParticipant)
                .join(bgmAgitClockTowerParticipant.record, bgmAgitClockTowerRecord)
                .join(bgmAgitClockTowerParticipant.bgmAgitMember, bgmAgitMember)
                .where(
                        bgmAgitClockTowerRecord.playDate.goe(startInclusive),
                        bgmAgitClockTowerRecord.playDate.lt(endExclusive),
                        notDraft()
                )
                .groupBy(bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname)
                .orderBy(playCount.desc(), bgmAgitMember.bgmAgitMemberNickname.asc())
                .fetch();
    }

    @Override
    public long countSessions(LocalDate startInclusive, LocalDate endExclusive) {
        Long c = queryFactory
                .select(bgmAgitClockTowerRecord.count())
                .from(bgmAgitClockTowerRecord)
                .where(
                        bgmAgitClockTowerRecord.playDate.goe(startInclusive),
                        bgmAgitClockTowerRecord.playDate.lt(endExclusive),
                        notDraft()
                )
                .fetchOne();
        return c != null ? c : 0L;
    }

    @Override
    public long countMemberSessions(Long memberId, LocalDate startInclusive, LocalDate endExclusive) {
        Long c = queryFactory
                .select(bgmAgitClockTowerParticipant.count())
                .from(bgmAgitClockTowerParticipant)
                .join(bgmAgitClockTowerParticipant.record, bgmAgitClockTowerRecord)
                .where(
                        bgmAgitClockTowerParticipant.bgmAgitMember.bgmAgitMemberId.eq(memberId),
                        bgmAgitClockTowerRecord.playDate.goe(startInclusive),
                        bgmAgitClockTowerRecord.playDate.lt(endExclusive),
                        notDraft()
                )
                .fetchOne();
        return c != null ? c : 0L;
    }

    @Override
    public List<MemberPlayHistoryResponse> findMemberGameHistory(Long memberId) {
        NumberExpression<Long> playCount = Expressions.numberTemplate(Long.class, "COUNT({0})", bgmAgitClockTowerRecord.id);
        var lastDate = Expressions.dateTemplate(LocalDate.class, "MAX({0})", bgmAgitClockTowerRecord.playDate);
        return queryFactory
                .select(new QMemberPlayHistoryResponse(
                        bgmAgitClockTowerGame.id,
                        bgmAgitClockTowerGame.name,
                        bgmAgitClockTowerGame.imageUrl,
                        playCount,
                        lastDate))
                .from(bgmAgitClockTowerParticipant)
                .join(bgmAgitClockTowerParticipant.record, bgmAgitClockTowerRecord)
                .join(bgmAgitClockTowerRecord.game, bgmAgitClockTowerGame)
                .where(bgmAgitClockTowerParticipant.bgmAgitMember.bgmAgitMemberId.eq(memberId), notDraft())
                .groupBy(bgmAgitClockTowerGame.id, bgmAgitClockTowerGame.name, bgmAgitClockTowerGame.imageUrl)
                .orderBy(lastDate.desc())
                .fetch();
    }

    @Override
    public List<MemberMonthlyBucketResponse> findMemberMonthlyBuckets(Long memberId) {
        StringExpression ym = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m')", bgmAgitClockTowerRecord.playDate);
        NumberExpression<Long> playCount = Expressions.numberTemplate(Long.class, "COUNT({0})", bgmAgitClockTowerRecord.id);
        return queryFactory
                .select(new QMemberMonthlyBucketResponse(ym, playCount))
                .from(bgmAgitClockTowerParticipant)
                .join(bgmAgitClockTowerParticipant.record, bgmAgitClockTowerRecord)
                .where(bgmAgitClockTowerParticipant.bgmAgitMember.bgmAgitMemberId.eq(memberId), notDraft())
                .groupBy(ym)
                .orderBy(ym.desc())
                .fetch();
    }

    // =========================== helpers ===========================

    // 완료 기록(임시저장 제외). draft 가 NULL 인 과거 데이터도 완료로 취급.
    private BooleanExpression notDraft() {
        return bgmAgitClockTowerRecord.draft.isNull().or(bgmAgitClockTowerRecord.draft.isFalse());
    }

    // 목록 노출 범위: 완료 기록은 모두, 임시저장은 작성자 본인(또는 관리자)에게만.
    private BooleanExpression statusVisible(Long viewerId, boolean isAdmin) {
        if (isAdmin) return null;
        BooleanExpression visible = notDraft();
        if (viewerId != null) {
            visible = visible.or(bgmAgitClockTowerRecord.bgmAgitMember.bgmAgitMemberId.eq(viewerId));
        }
        return visible;
    }

    private BooleanExpression gameEq(Long gameId) {
        return gameId != null ? bgmAgitClockTowerRecord.game.id.eq(gameId) : null;
    }

    private BooleanExpression dateGoe(LocalDate start) {
        return start != null ? bgmAgitClockTowerRecord.playDate.goe(start) : null;
    }

    private BooleanExpression dateLt(LocalDate end) {
        return end != null ? bgmAgitClockTowerRecord.playDate.lt(end) : null;
    }

    private BooleanExpression participatedBy(Long memberId) {
        if (memberId == null) return null;
        return JPAExpressions.selectOne()
                .from(bgmAgitClockTowerParticipant)
                .where(
                        bgmAgitClockTowerParticipant.record.eq(bgmAgitClockTowerRecord),
                        bgmAgitClockTowerParticipant.bgmAgitMember.bgmAgitMemberId.eq(memberId)
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
