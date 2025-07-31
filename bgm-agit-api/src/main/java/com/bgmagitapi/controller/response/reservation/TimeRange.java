package com.bgmagitapi.controller.response.reservation;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Getter
public class TimeRange {
    private final LocalDateTime start;
    private final LocalDateTime end;
    private final String approvalStatus;
    private final Long memberId;
    
}
