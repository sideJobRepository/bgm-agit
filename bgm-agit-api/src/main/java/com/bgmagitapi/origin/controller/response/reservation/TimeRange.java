package com.bgmagitapi.origin.controller.response.reservation;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * 예약 1건의 점유 구간(절대시각). 자정을 넘기는 예약은 end 가 다음 날이다(SlotSchedule.toPeriod).
 */
@RequiredArgsConstructor
@Getter
public class TimeRange {
    private final LocalDate businessDate;
    private final LocalDateTime start;
    private final LocalDateTime end;
    private final String approvalStatus;
    private final Long memberId;
    private final String cancelStatus;

    /**
     * 이 예약이 슬롯을 점유하는지. 확정건이거나 내 대기건이면서 취소되지 않았고 구간이 겹칠 때만 점유다.
     * 남의 대기건은 자리를 막지 않는다(결제 승인 직전 재검증이 이중 확정을 막는다).
     */
    public boolean isOverlapping(LocalDateTime slotStart, LocalDateTime slotEnd, Long currentUserId) {
        boolean isConfirmed = "Y".equalsIgnoreCase(this.approvalStatus);
        boolean isMyPending = "N".equalsIgnoreCase(this.approvalStatus)
                && currentUserId != null
                && Objects.equals(this.memberId, currentUserId);

        return (isConfirmed || isMyPending)
                && "N".equals(this.cancelStatus)
                && slotStart.isBefore(this.end)
                && slotEnd.isAfter(this.start);
    }
}
