package com.bgmagitapi.origin.controller.response.reservation;

import com.bgmagitapi.origin.util.SlotSchedule;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * 예약 한 건의 실제 이용 구간과 상태.
 * start/end 는 SlotSchedule.useRange 로 이미 자정 넘김이 보정된 절대시각이다.
 */
@RequiredArgsConstructor
@Getter
public class TimeRange {
    private final LocalDateTime start;
    private final LocalDateTime end;
    private final String approvalStatus;
    private final Long memberId;
    private final String cancelStatus;

    /**
     * 이 예약이 [slotStart, slotEnd) 를 점유하는지.
     * 점유로 치는 것은 취소되지 않은 확정건, 또는 조회한 본인의 대기건이다(남의 대기건은 자리를 막지 않는다).
     */
    public boolean isOverlapping(LocalDateTime slotStart, LocalDateTime slotEnd, Long currentUserId) {
        if (!"N".equalsIgnoreCase(this.cancelStatus)) {
            return false;
        }
        boolean isConfirmed = "Y".equalsIgnoreCase(this.approvalStatus);
        boolean isMyPending = "N".equalsIgnoreCase(this.approvalStatus)
                && currentUserId != null
                && Objects.equals(this.memberId, currentUserId);
        return (isConfirmed || isMyPending)
                && SlotSchedule.isOverlapping(slotStart, slotEnd, this.start, this.end);
    }
}
