package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface BgmAgitReservationCustomRepository {

    /**
     * 방 여러 개 × 기간의 점유 구간. 예약 캘린더(GET /reservation)용.
     * 취소·승인 필터는 걸지 않는다 — 점유 판정은 TimeRange.isOverlapping 이 하는 게 규약이고,
     * 여기서만 SQL 로 거르면 캘린더·배지·등록 충돌 검사의 기준이 갈린다.
     */
    Map<Long, List<ReservedTimeDto>> findReservedTimesByRoomIds(List<Long> roomIds, LocalDate from, LocalDate to);

    /** 방 여러 개 × 날짜 하나. 가용 배지·등록 충돌 검사용. 방이 없으면 빈 맵. */
    Map<Long, List<ReservedTimeDto>> findReservedTimesByRoomIdsAndDate(List<Long> roomIds, LocalDate date);

    /**
     * 결제 승인 직전 슬롯 재검증용.
     * 지정한 방·날짜에서 이미 확정(취소 아님)된 예약의 점유 구간을, 자기 예약은 빼고 조회한다.
     */
    List<ReservedTimeDto> findConfirmedReservations(List<Long> roomIds, LocalDate date, Long excludeReservationId);

    /** 예약 한 건 + 회원 + 방들(fetch join). 없으면 empty. */
    Optional<BgmAgitReservation> findReservationWithRooms(Long reservationId);

    /** 예약내역 페이징. 부모(예약)로 페이징하고 방은 같은 페이지 id 로 한 번에 fetch 한다. */
    Page<BgmAgitReservation> findReservationPageForDetail(Long memberId, boolean isUserRole,
                                                         LocalDate start, LocalDate end, Pageable pageable);

    /** 관리자 현황판·09시 알림용. 해당 영업일의 예약 전체(회원·방 fetch join), 페이징 없음. */
    List<BgmAgitReservation> findReservationsByDate(LocalDate date);
}
