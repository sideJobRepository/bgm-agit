package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.entity.BgmAgitReservationRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface BgmAgitReservationCustomRepository {

    /**
     * 방별 예약 점유 구간(기간). 예약 캘린더(기간)와 방 목록 배지(하루, from == to)가 같이 쓴다.
     * 방 수만큼 쿼리를 돌지 않도록 한 번에 조회해 roomId 로 묶어 돌려준다.
     * 취소·승인 필터는 걸지 않는다. 점유 판정은 TimeRange.isOverlapping 이 하므로 두 화면 기준이 갈리지 않는다.
     */
    Map<Long, List<ReservedTimeDto>> findReservedTimesByRoomIds(List<Long> roomIds, LocalDate from, LocalDate to);

    /** 예약 등록 충돌 검사용. 지정 방·날짜의 취소 안 된 예약(예약·방 fetch). 확정/내 대기건 필터는 서비스가 한다. */
    List<BgmAgitReservationRoom> findActiveReservationRooms(List<Long> roomIds, LocalDate date);

    /**
     * 결제 승인 직전 재검증용.
     * 지정 방·날짜에서 이미 확정(취소 아님)된 예약을, 자기 예약은 빼고 조회한다(예약·방 fetch).
     */
    List<BgmAgitReservationRoom> findConfirmedReservationRooms(List<Long> roomIds, LocalDate date, Long excludeReservationId);

    /** 예약 1건 + 회원 + 방들. */
    Optional<BgmAgitReservation> findReservationWithRooms(Long reservationId);

    /** 예약내역(10건 페이징). 부모만 페이징하고 방은 같은 영속성 컨텍스트로 한 번 더 fetch 한다. */
    Page<BgmAgitReservation> findReservationPageForDetail(Long memberId, boolean isUserRole, LocalDate start, LocalDate end, Pageable pageable);

    /** 관리자 현황판·09시 알림톡용. 해당 영업일 예약 전체(회원·방 fetch), 페이징 없음. */
    List<BgmAgitReservation> findReservationsByDate(LocalDate date);
}
