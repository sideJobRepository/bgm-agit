package com.bgmagitapi.service;

import com.bgmagitapi.controller.response.BgmAgitReservationResponse;

import java.time.LocalDate;

public interface BgmAgitReservationService {
    
    BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id,LocalDate date);
}
