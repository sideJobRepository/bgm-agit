package com.bgmagitapi.controller.response;

import com.bgmagitapi.entity.enumeration.Reservation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BgmAgitReservationDetailResponse {
    
    private Long bgmAgitReservationId;
    private Long bgmAgitMemberId;
    private Long bgmAgitImageId;
    private Reservation reservation;
    private LocalDate bgmAgitReservationStartDate;
    private LocalTime bgmAgitReservationStartTime;
    private LocalDate bgmAgitReservationEndTime;
}
