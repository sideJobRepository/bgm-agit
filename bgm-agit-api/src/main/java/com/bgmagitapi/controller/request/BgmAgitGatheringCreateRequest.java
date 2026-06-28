package com.bgmagitapi.controller.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
public class BgmAgitGatheringCreateRequest {

    // MURDER_MYSTERY / CLOCK_TOWER
    @NotNull
    private String gatheringType;

    @NotNull
    private String title;

    private String scenarioName;

    private String place;

    private String description;

    @NotNull
    private LocalDate gatheringDate;

    @NotNull
    private LocalTime startTime;

    private LocalTime endTime;

    @NotNull
    private Integer minPeople;

    @NotNull
    private Integer maxPeople;

    @NotNull
    private LocalDateTime recruitDeadline;
}
