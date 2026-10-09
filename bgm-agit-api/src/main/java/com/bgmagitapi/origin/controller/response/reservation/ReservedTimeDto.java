package com.bgmagitapi.origin.controller.response.reservation;

import com.bgmagitapi.origin.util.SlotSchedule;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 방 하나에 걸린 예약 1건의 점유 구간(조회용 프로젝션).
 *
 * <b>필드를 추가하지 말 것.</b> Projections.constructor 는 위치 기반이라 인자 순서가 곧 필드 순서이고,
 * 같은 타입(Long 등)이 섞이면 순서가 어긋나도 컴파일이 통과한다. 프로젝션은
 * BgmAgitReservationRepositoryImpl.reservedTimeProjection() 한 곳에서만 만든다.
 * (방 id 는 DTO 에 넣지 않고 transform(groupBy(roomId)) 의 키로 받는다)
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservedTimeDto {
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String approvalStatus;
    private Long memberId;
    private String cancelStatus;

    /** 영업일별 점유 구간. 키는 영업일(예약의 START_DATE)이라 익일 새벽 구간도 그 날에 묶인다. */
    public static Map<LocalDate, List<TimeRange>> groupedReservation(List<ReservedTimeDto> reservations) {
        return reservations.stream()
                .map(res -> {
                    SlotSchedule.Slot period = SlotSchedule.toPeriod(res.getDate(), res.getStartTime(), res.getEndTime());
                    if (period == null) {
                        return null;
                    }
                    return new TimeRange(res.getDate(), period.start(), period.end(),
                            res.getApprovalStatus(), res.getMemberId(), res.getCancelStatus());
                })
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(TimeRange::getBusinessDate));
    }
}
