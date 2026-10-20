package com.bgmagitapi.origin.controller.response.reservation;

import com.bgmagitapi.origin.util.SlotSchedule;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 방 하나에 걸린 예약 한 건의 점유 구간(예약 ⋈ 예약방).
 *
 * <b>필드 추가·순서 변경 금지.</b> Projections.constructor 가 위치 기반인데 roomId 와 memberId 가
 * 둘 다 Long 이라 순서가 어긋나도 컴파일이 통과하고, 어긋나면 남의 대기 예약이 내 것처럼 점유 처리된다.
 * 프로젝션은 BgmAgitReservationRepositoryImpl.reservedTimeProjection() 한 곳에서만 만든다.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservedTimeDto {
    private Long roomId;
    private Long reservationId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String approvalStatus;
    private Long memberId;
    private String cancelStatus;

    /** 실제 이용 구간 + 상태. 충돌·점유 판정은 이걸로 한다. */
    public TimeRange toTimeRange() {
        SlotSchedule.Slot range = SlotSchedule.useRange(date, startTime, endTime);
        return new TimeRange(range.start(), range.end(), approvalStatus, memberId, cancelStatus);
    }

    /**
     * 영업일별 점유 구간. 키는 예약의 영업일(startDate)이다 — 경계(10시) 이전 새벽 구간도 그 영업일 슬롯과 비교된다.
     */
    public static Map<LocalDate, List<TimeRange>> groupedReservation(List<ReservedTimeDto> reservations) {
        return reservations.stream()
                .filter(res -> res.getDate() != null && res.getStartTime() != null && res.getEndTime() != null)
                .collect(Collectors.groupingBy(
                        ReservedTimeDto::getDate,
                        Collectors.mapping(ReservedTimeDto::toTimeRange, Collectors.toList())));
    }
}
