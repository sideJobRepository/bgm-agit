package com.bgmagitapi.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.controller.response.ReservationAvailabilityResponse;
import com.bgmagitapi.service.BgmAgitReservationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;

class BgmAgitReservationServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private BgmAgitReservationService bgmAgitReservationService;
    
    @DisplayName("")
    @Test
    void test() throws JsonProcessingException {
        
        
        ReservationAvailabilityResponse reservation = bgmAgitReservationService.getReservation(
                3L,
                "/detail/room",
                LocalDate.of(2025, 7, 24)
        );
        
        String s = objectMapper.writeValueAsString(reservation);
        System.out.println(s);
        
    }
}