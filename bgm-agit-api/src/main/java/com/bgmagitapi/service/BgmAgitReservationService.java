package com.bgmagitapi.service;

import com.bgmagitapi.controller.response.BgmAgitReservationResponse;

import java.time.LocalDate;
import java.util.List;

public interface BgmAgitReservationService {
    
    List<BgmAgitReservationResponse> getReservation(Long labelGb, String link, LocalDate date);
}
