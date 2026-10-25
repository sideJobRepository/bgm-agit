package com.bgmagitapi.origin.clocktower.repository.impl;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerSession;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerSessionSeat;
import com.bgmagitapi.origin.clocktower.repository.custom.BgmAgitClockTowerSessionCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static com.bgmagitapi.origin.clocktower.entity.QBgmAgitClockTowerSession.bgmAgitClockTowerSession;
import static com.bgmagitapi.origin.clocktower.entity.QBgmAgitClockTowerSessionSeat.bgmAgitClockTowerSessionSeat;

@RequiredArgsConstructor
public class BgmAgitClockTowerSessionRepositoryImpl implements BgmAgitClockTowerSessionCustomRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public long closeActiveByStoryteller(Long storytellerMemberId, LocalDateTime now) {
        return queryFactory
                .update(bgmAgitClockTowerSession)
                .set(bgmAgitClockTowerSession.status, BgmAgitClockTowerSession.CLOSED)
                .set(bgmAgitClockTowerSession.modifyDate, now)
                .where(bgmAgitClockTowerSession.storytellerMemberId.eq(storytellerMemberId),
                        bgmAgitClockTowerSession.status.eq(BgmAgitClockTowerSession.ACTIVE))
                .execute();
    }

    @Override
    public List<BgmAgitClockTowerSessionSeat> findSeats(Long sessionId) {
        return queryFactory
                .selectFrom(bgmAgitClockTowerSessionSeat)
                .where(bgmAgitClockTowerSessionSeat.sessionId.eq(sessionId))
                .orderBy(bgmAgitClockTowerSessionSeat.seatNo.asc(), bgmAgitClockTowerSessionSeat.id.asc())
                .fetch();
    }

    @Override
    public Optional<BgmAgitClockTowerSessionSeat> findSeat(Long sessionId, Long memberId) {
        return Optional.ofNullable(queryFactory
                .selectFrom(bgmAgitClockTowerSessionSeat)
                .where(bgmAgitClockTowerSessionSeat.sessionId.eq(sessionId),
                        bgmAgitClockTowerSessionSeat.memberId.eq(memberId))
                .fetchFirst());
    }

    @Override
    public Optional<BgmAgitClockTowerSessionSeat> findLatestActiveSeat(Long memberId, LocalDateTime createdAfter) {
        return Optional.ofNullable(queryFactory
                .select(bgmAgitClockTowerSessionSeat)
                .from(bgmAgitClockTowerSessionSeat, bgmAgitClockTowerSession)
                .where(bgmAgitClockTowerSessionSeat.sessionId.eq(bgmAgitClockTowerSession.id),
                        bgmAgitClockTowerSessionSeat.memberId.eq(memberId),
                        bgmAgitClockTowerSession.status.eq(BgmAgitClockTowerSession.ACTIVE),
                        bgmAgitClockTowerSession.registDate.gt(createdAfter))
                .orderBy(bgmAgitClockTowerSession.id.desc())
                .fetchFirst());
    }
}
