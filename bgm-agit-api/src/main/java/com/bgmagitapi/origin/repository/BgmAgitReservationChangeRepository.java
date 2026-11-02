package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitReservationChange;
import com.bgmagitapi.origin.entity.enumeration.ReservationChangeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BgmAgitReservationChangeRepository extends JpaRepository<BgmAgitReservationChange, Long> {

    /** 예약의 특정 상태 변경 요청(최신 순). PENDING 조회에 쓴다 */
    List<BgmAgitReservationChange> findByBgmAgitReservationIdAndBgmAgitChangeStatusOrderByBgmAgitReservationChangeIdDesc(
            Long reservationId, ReservationChangeStatus status);

    /**
     * 예약의 PENDING 변경 요청을 전부 ABORTED 로. 새 변경 요청·즉시 변경·예약 취소 때 부른다.
     * 옛 요청의 추가결제가 뒤늦게 승인되면 다른 내용으로 바뀐 예약을 또 바꾸게 되므로 먼저 끊는다.
     * (그 READY 주문은 호출부가 abortReadyOrders 로 같이 끊는다)
     * clearAutomatically 를 켜지 않는다 — 호출부가 들고 있는 예약 엔티티가 분리되면 안 된다.
     */
    @Modifying(flushAutomatically = true)
    @Query("update BgmAgitReservationChange c"
            + " set c.bgmAgitChangeStatus = :aborted, c.modifyDate = CURRENT_TIMESTAMP"
            + " where c.bgmAgitReservationId = :reservationId and c.bgmAgitChangeStatus = :pending")
    int abortPendingChanges(@Param("reservationId") Long reservationId,
                            @Param("pending") ReservationChangeStatus pending,
                            @Param("aborted") ReservationChangeStatus aborted);

    /** 예약의 PENDING 변경 요청을 전부 ABORTED 로(위 쿼리의 편의 메서드) */
    default int abortPendingChanges(Long reservationId) {
        return abortPendingChanges(reservationId, ReservationChangeStatus.PENDING, ReservationChangeStatus.ABORTED);
    }
}
