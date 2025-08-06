package com.bgmagitapi.controller.response.reservation;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;

@RequiredArgsConstructor
@Getter
public class TimeRange {
    private final LocalDateTime start;
    private final LocalDateTime end;
    private final String approvalStatus;
    private final Long memberId;
    
    
    
    public boolean isOverlapping(LocalDateTime slotStart, LocalDateTime slotEnd, Long currentUserId) {
        boolean isConfirmed = "Y".equalsIgnoreCase(this.approvalStatus);
        boolean isMyPending = "N".equalsIgnoreCase(this.approvalStatus)
                && currentUserId != null
                && Objects.equals(this.memberId, currentUserId);
        
        LocalDateTime adjustedEnd = this.end;
        
        // slotStart가 end보다 날짜가 크면 새벽 예약
        if (slotStart.toLocalDate().isAfter(this.end.toLocalDate())) {
            adjustedEnd = adjustEndForComparison(this.end);
        }
        
        return (isConfirmed || isMyPending)
                && slotStart.isBefore(adjustedEnd)
                && slotEnd.isAfter(this.start);
    }
    
    private LocalDateTime adjustEndForComparison(LocalDateTime end) {
        LocalTime endTime = end.toLocalTime();
        // 13:00 이전 또는 23:00 이후면 다음 날로 간주
        if (endTime.isBefore(LocalTime.of(13, 0)) || endTime.isAfter(LocalTime.of(23, 0))) {
            return end.plusDays(1);
        }
        return end;
    }
}
