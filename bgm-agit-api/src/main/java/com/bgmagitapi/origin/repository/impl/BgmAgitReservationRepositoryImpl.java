package com.bgmagitapi.origin.repository.impl;

import com.bgmagitapi.origin.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.entity.BgmAgitReservationRoom;
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
     * 예약 점유 구간 프로젝션.
     * ReservedTimeDto 는 @AllArgsConstructor + Projections.constructor 라 <b>인자 순서가 곧 필드 순서</b>다.
     * 순서가 어긋나도 타입만 맞으면 컴파일이 통과하므로 프로젝션은 여기 한 곳에서만 만든다.
     */
    private ConstructorExpression<ReservedTimeDto> reservedTimeProjection() {
        return Projections.constructor(
                ReservedTimeDto.class,
                bgmAgitReservation.bgmAgitReservationStartDate,
                bgmAgitReservation.bgmAgitReservationStartTime,
                bgmAgitReservation.bgmAgitReservationEndTime,
                bgmAgitReservation.bgmAgitReservationApprovalStatus,
                bgmAgitReservation.bgmAgitMember.bgmAgitMemberId,
                bgmAgitReservation.bgmAgitReservationCancelStatus
        );
    }

    @Override
    public Map<Long, List<ReservedTimeDto>> findReservedTimesByRoomIds(List<Long> roomIds, LocalDate from, LocalDate to) {
        if (roomIds == null || roomIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, List<ReservedTimeDto>> grouped = queryFactory
                .from(bgmAgitReservationRoom)
                .join(bgmAgitReservationRoom.bgmAgitReservation, bgmAgitReservation)
                .where(
                        bgmAgitReservationRoom.bgmAgitRoom.bgmAgitRoomId.in(roomIds),
                        bgmAgitReservation.bgmAgitReservationStartDate.between(from, to)
                )
                .transform(GroupBy.groupBy(bgmAgitReservationRoom.bgmAgitRoom.bgmAgitRoomId)
                        .as(GroupBy.list(reservedTimeProjection())));
        return grouped == null ? Map.of() : grouped;
    }

    @Override
    public List<BgmAgitReservationRoom> findActiveReservationRooms(List<Long> roomIds, LocalDate date) {
        if (roomIds == null || roomIds.isEmpty()) {
            return List.of();
        }
        return queryFactory
                .selectFrom(bgmAgitReservationRoom)
                .join(bgmAgitReservationRoom.bgmAgitReservation, bgmAgitReservation).fetchJoin()
                .join(bgmAgitReservationRoom.bgmAgitRoom, bgmAgitRoom).fetchJoin()
                .where(
                        bgmAgitRoom.bgmAgitRoomId.in(roomIds),
                        bgmAgitReservation.bgmAgitReservationStartDate.eq(date),
                        bgmAgitReservation.bgmAgitReservationCancelStatus.eq("N")
                )
                .fetch();
    }

    @Override
    public List<BgmAgitReservationRoom> findConfirmedReservationRooms(List<Long> roomIds, LocalDate date, Long excludeReservationId) {
        if (roomIds == null || roomIds.isEmpty()) {
            return List.of();
        }
        return queryFactory
                .selectFrom(bgmAgitReservationRoom)
                .join(bgmAgitReservationRoom.bgmAgitReservation, bgmAgitReservation).fetchJoin()
                .join(bgmAgitReservationRoom.bgmAgitRoom, bgmAgitRoom).fetchJoin()
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
        return Optional.ofNullable(
                queryFactory
                        .selectFrom(bgmAgitReservation)
                        .distinct()
                        .join(bgmAgitReservation.bgmAgitMember, bgmAgitMember).fetchJoin()
                        .leftJoin(bgmAgitReservation.bgmAgitReservationRooms, bgmAgitReservationRoom).fetchJoin()
                        .leftJoin(bgmAgitReservationRoom.bgmAgitRoom, bgmAgitRoom).fetchJoin()
                        .where(bgmAgitReservation.bgmAgitReservationId.eq(reservationId))
                        .fetchOne()
        );
    }

    @Override
    public Page<BgmAgitReservation> findReservationPageForDetail(Long memberId, boolean isUserRole, LocalDate start, LocalDate end, Pageable pageable) {
        // 1) 부모만 페이징. N:1 회원만 fetch join 한다(컬렉션 fetch join 과 페이징을 섞으면 메모리 페이징이 된다)
        List<BgmAgitReservation> content = queryFactory
                .selectFrom(bgmAgitReservation)
                .join(bgmAgitReservation.bgmAgitMember, bgmAgitMember).fetchJoin()
                .where(isUserFilter(memberId, isUserRole), dateBetween(start, end))
                .orderBy(bgmAgitReservation.bgmAgitReservationId.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        if (content.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0L);
        }

        // 2) 같은 영속성 컨텍스트에서 방을 fetch 해 위 엔티티들의 컬렉션을 채운다
        List<Long> ids = content.stream().map(BgmAgitReservation::getBgmAgitReservationId).toList();
        queryFactory
                .selectFrom(bgmAgitReservation)
                .distinct()
                .leftJoin(bgmAgitReservation.bgmAgitReservationRooms, bgmAgitReservationRoom).fetchJoin()
                .leftJoin(bgmAgitReservationRoom.bgmAgitRoom, bgmAgitRoom).fetchJoin()
                .where(bgmAgitReservation.bgmAgitReservationId.in(ids))
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
                .distinct()
                .join(bgmAgitReservation.bgmAgitMember, bgmAgitMember).fetchJoin()
                .leftJoin(bgmAgitReservation.bgmAgitReservationRooms, bgmAgitReservationRoom).fetchJoin()
                .leftJoin(bgmAgitReservationRoom.bgmAgitRoom, bgmAgitRoom).fetchJoin()
                .where(bgmAgitReservation.bgmAgitReservationStartDate.eq(date))
                .orderBy(bgmAgitReservation.bgmAgitReservationId.asc())
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
