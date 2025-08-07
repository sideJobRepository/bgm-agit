package com.bgmagitapi.controller.response.reservation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

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
}
