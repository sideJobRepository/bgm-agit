package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.controller.request.BgmAgitReservationCreateRequest;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.LocalDate;

public interface BgmAgitReservationService {
    
    BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id,LocalDate date);
    
    ApiResponse createReservation(BgmAgitReservationCreateRequest request, Jwt jwt);
}
