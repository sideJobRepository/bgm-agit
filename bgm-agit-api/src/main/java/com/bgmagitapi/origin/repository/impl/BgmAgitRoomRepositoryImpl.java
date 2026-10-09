package com.bgmagitapi.origin.repository.impl;

import com.bgmagitapi.origin.entity.BgmAgitRoom;
import com.bgmagitapi.origin.repository.custom.BgmAgitRoomCustomRepository;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.bgmagitapi.origin.entity.QBgmAgitReservationRoom.bgmAgitReservationRoom;
import static com.bgmagitapi.origin.entity.QBgmAgitRoom.bgmAgitRoom;

@RequiredArgsConstructor
public class BgmAgitRoomRepositoryImpl implements BgmAgitRoomCustomRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<BgmAgitRoom> findRooms(String link, boolean includeHidden) {
        return queryFactory
                .selectFrom(bgmAgitRoom)
                .where(linkEq(link), includeHidden ? null : notHidden())
                .orderBy(bgmAgitRoom.bgmAgitRoomId.asc())
                .fetch();
    }

    @Override
    public List<BgmAgitRoom> findReservableRooms(String link) {
        return findRooms(link, false);
    }

    @Override
    public boolean existsReservationByRoomId(Long roomId) {
        Integer found = queryFactory
                .selectOne()
                .from(bgmAgitReservationRoom)
                .where(bgmAgitReservationRoom.bgmAgitRoom.bgmAgitRoomId.eq(roomId))
                .fetchFirst();
        return found != null;
    }

    // 컬럼이 null 인 행도 노출로 취급(이관 후엔 NOT NULL 이지만 방어)
    private BooleanExpression notHidden() {
        return bgmAgitRoom.bgmAgitRoomUseStatus.isNull()
                .or(bgmAgitRoom.bgmAgitRoomUseStatus.ne("N"));
    }

    private BooleanExpression linkEq(String link) {
        return StringUtils.hasText(link) ? bgmAgitRoom.bgmAgitRoomLink.eq(link) : null;
    }
}
