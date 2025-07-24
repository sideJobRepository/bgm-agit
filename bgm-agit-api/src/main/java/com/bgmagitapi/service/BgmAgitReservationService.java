package com.bgmagitapi.service;

import com.bgmagitapi.controller.response.ReservationAvailabilityResponse;

import java.time.LocalDate;

public interface BgmAgitReservationService {
    
    ReservationAvailabilityResponse getReservation(Long labelGb, String link, LocalDate date);
}
