package com.bgmagitapi.controller.response.reservation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservedTimeDto {
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String label;
    private String group;
    private String approvalStatus;
    private Long memberId;
    private String cancelStatus;
    private Integer minPeople;
    private Integer maxPeople;
    
    
    public static Map<LocalDate, List<TimeRange>> groupedReservation(List<ReservedTimeDto> reservations) {
        return reservations.stream()
                .map(res -> {
                    LocalDateTime start = LocalDateTime.of(res.getDate(), res.getStartTime());
                    LocalDateTime end = res.getEndTime().isBefore(res.getStartTime())
                            ? LocalDateTime.of(res.getDate().plusDays(1), res.getEndTime())
                            : LocalDateTime.of(res.getDate(), res.getEndTime());
                    return new TimeRange(start, end, res.getApprovalStatus(), res.getMemberId() , res.getCancelStatus());
                })
                .collect(Collectors.groupingBy(r -> r.getStart().toLocalDate()));
    }
}
