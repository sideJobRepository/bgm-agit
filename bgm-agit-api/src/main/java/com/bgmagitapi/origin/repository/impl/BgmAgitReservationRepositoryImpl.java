package com.bgmagitapi.origin.repository.impl;

import com.bgmagitapi.origin.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.repository.custom.BgmAgitReservationCustomRepository;
import com.querydsl.core.group.GroupBy;
import com.querydsl.core.types.ConstructorExpression;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.bgmagitapi.origin.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.origin.entity.QBgmAgitReservation.bgmAgitReservation;
import static com.bgmagitapi.origin.entity.QBgmAgitReservationRoom.bgmAgitReservationRoom;
import static com.bgmagitapi.origin.entity.QBgmAgitRoom.bgmAgitRoom;

@RequiredArgsConstructor
public class BgmAgitReservationRepositoryImpl implements BgmAgitReservationCustomRepository {

    private final JPAQueryFactory queryFactory;

    /**
     * 점유 구간 프로젝션(RESERVATION_ROOM ⋈ RESERVATION ⋈ ROOM).
     * ReservedTimeDto 는 @AllArgsConstructor + Projections.constructor 라 <b>인자 순서가 곧 필드 순서</b>다.
     * roomId·reservationId·memberId 가 전부 Long 이라 순서가 어긋나도 컴파일이 통과하므로,
     * 프로젝션을 쓰는 쿼리가 갈리지 않도록 여기 한 곳에서만 만든다.
     */
    private ConstructorExpression<ReservedTimeDto> reservedTimeProjection() {
        return Projections.constructor(
                ReservedTimeDto.class,
                bgmAgitRoom.bgmAgitRoomId,
                bgmAgitReservation.bgmAgitReservationId,
                bgmAgitReservation.bgmAgitReservationStartDate,
                bgmAgitReservation.bgmAgitReservationStartTime,
                bgmAgitReservation.bgmAgitReservationEndTime,
                bgmAgitReservation.bgmAgitReservationApprovalStatus,
                bgmAgitReservation.bgmAgitMember.bgmAgitMemberId,
                bgmAgitReservation.bgmAgitReservationCancelStatus
        );
    }

    /** 예약방 기준 조인. 점유 조회는 전부 여기서 시작한다. */
    private JPAQuery<?> reservedTimeBase() {
        return queryFactory
                .from(bgmAgitReservationRoom)
                .join(bgmAgitReservationRoom.bgmAgitReservation, bgmAgitReservation)
                .join(bgmAgitReservationRoom.bgmAgitRoom, bgmAgitRoom);
    }

    @Override
    public Map<Long, List<ReservedTimeDto>> findReservedTimesByRoomIds(List<Long> roomIds, LocalDate from, LocalDate to) {
        if (roomIds == null || roomIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, List<ReservedTimeDto>> grouped = reservedTimeBase()
                .where(
                        bgmAgitRoom.bgmAgitRoomId.in(roomIds),
                        bgmAgitReservation.bgmAgitReservationStartDate.between(from, to)
                )
                .transform(GroupBy.groupBy(bgmAgitRoom.bgmAgitRoomId)
                        .as(GroupBy.list(reservedTimeProjection())));
        return grouped == null ? Map.of() : grouped;
    }

    @Override
    public Map<Long, List<ReservedTimeDto>> findReservedTimesByRoomIdsAndDate(List<Long> roomIds, LocalDate date) {
        return findReservedTimesByRoomIds(roomIds, date, date);
    }

    @Override
    public List<ReservedTimeDto> findConfirmedReservations(List<Long> roomIds, LocalDate date, Long excludeReservationId) {
        if (roomIds == null || roomIds.isEmpty()) {
            return List.of();
        }
        return reservedTimeBase()
                .select(reservedTimeProjection())
                .where(
                        bgmAgitRoom.bgmAgitRoomId.in(roomIds),
                        bgmAgitReservation.bgmAgitReservationStartDate.eq(date),
                        bgmAgitReservation.bgmAgitReservationCancelStatus.eq("N"),
                        bgmAgitReservation.bgmAgitReservationApprovalStatus.eq("Y"),
                        excludeReservationId == null
                                ? null
                                : bgmAgitReservation.bgmAgitReservationId.ne(excludeReservationId)
                )
                .fetch();
    }

    @Override
    public Optional<BgmAgitReservation> findReservationWithRooms(Long reservationId) {
        if (reservationId == null) {
            return Optional.empty();
        }
        // 컬렉션 fetch join 이라 fetchOne(내부적으로 limit 을 걸 수 있다) 대신 fetch 후 첫 건을 쓴다.
        // 예약 ID 는 PK 라 distinct 뒤에는 0 또는 1건이다.
        return queryFactory
                .selectFrom(bgmAgitReservation)
                .join(bgmAgitReservation.bgmAgitMember, bgmAgitMember).fetchJoin()
                .leftJoin(bgmAgitReservation.rooms, bgmAgitReservationRoom).fetchJoin()
                .leftJoin(bgmAgitReservationRoom.bgmAgitRoom, bgmAgitRoom).fetchJoin()
                .where(bgmAgitReservation.bgmAgitReservationId.eq(reservationId))
                .distinct()
                .fetch()
                .stream()
                .findFirst();
    }

    @Override
    public Page<BgmAgitReservation> findReservationPageForDetail(Long memberId, boolean isUserRole,
                                                                LocalDate start, LocalDate end, Pageable pageable) {
        // 컬렉션 fetch join 과 limit 을 같이 쓰면 Hibernate 가 전체를 메모리에서 자른다.
        // 그래서 페이지 id 만 먼저 고르고, 그 id 들로 방까지 한 번에 가져온다.
        List<Long> pageIds = queryFactory
                .select(bgmAgitReservation.bgmAgitReservationId)
                .from(bgmAgitReservation)
                .where(isUserFilter(memberId, isUserRole), dateBetween(start, end))
                .orderBy(bgmAgitReservation.bgmAgitReservationId.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        if (pageIds.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0L);
        }

        List<BgmAgitReservation> content = queryFactory
                .selectFrom(bgmAgitReservation)
                .join(bgmAgitReservation.bgmAgitMember, bgmAgitMember).fetchJoin()
                .leftJoin(bgmAgitReservation.rooms, bgmAgitReservationRoom).fetchJoin()
                .leftJoin(bgmAgitReservationRoom.bgmAgitRoom, bgmAgitRoom).fetchJoin()
                .where(bgmAgitReservation.bgmAgitReservationId.in(pageIds))
                .orderBy(bgmAgitReservation.bgmAgitReservationId.desc())
                .distinct()
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitReservation.count())
                .from(bgmAgitReservation)
                .where(isUserFilter(memberId, isUserRole), dateBetween(start, end));

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    @Override
    public List<BgmAgitReservation> findReservationsByDate(LocalDate date) {
        return queryFactory
                .selectFrom(bgmAgitReservation)
                .join(bgmAgitReservation.bgmAgitMember, bgmAgitMember).fetchJoin()
                .leftJoin(bgmAgitReservation.rooms, bgmAgitReservationRoom).fetchJoin()
                .leftJoin(bgmAgitReservationRoom.bgmAgitRoom, bgmAgitRoom).fetchJoin()
                .where(bgmAgitReservation.bgmAgitReservationStartDate.eq(date))
                .orderBy(
                        bgmAgitReservation.bgmAgitReservationStartTime.asc(),
                        bgmAgitReservation.bgmAgitReservationId.asc()
                )
                .distinct()
                .fetch();
    }

    private BooleanExpression isUserFilter(Long memberId, boolean isUser) {
        return isUser ? bgmAgitReservation.bgmAgitMember.bgmAgitMemberId.eq(memberId) : null;
    }

    private BooleanExpression dateBetween(LocalDate start, LocalDate end) {
        if (start != null && end != null) return bgmAgitReservation.bgmAgitReservationStartDate.between(start, end);
        if (start != null) return bgmAgitReservation.bgmAgitReservationStartDate.goe(start);
        if (end != null) return bgmAgitReservation.bgmAgitReservationStartDate.loe(end);
        return null;
    }
}
