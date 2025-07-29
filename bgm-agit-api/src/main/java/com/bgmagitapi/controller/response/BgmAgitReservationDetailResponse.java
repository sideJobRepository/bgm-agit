package com.bgmagitapi.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BgmAgitReservationDetailResponse {
    
    private Long bgmAgitReservationId;
    private Long bgmAgitMemberId;
    private Long bgmAgitImageId;
    private String reservation;
    private LocalDate bgmAgitReservationStartDate;
    private LocalTime bgmAgitReservationStartTime;
    private LocalTime bgmAgitReservationEndTime;
    
    private String bgmAgitReservationCancelStatus;
    
    private Long bgmAgitReservationNo;
    
}
