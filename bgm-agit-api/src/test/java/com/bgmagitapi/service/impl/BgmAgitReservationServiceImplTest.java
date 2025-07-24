package com.bgmagitapi.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.service.BgmAgitReservationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class BgmAgitReservationServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private BgmAgitReservationService bgmAgitReservationService;
    
    @DisplayName("")
    @Test
    void test(){
        
        
        bgmAgitReservationService.getReservation(
                3L,
                "/detail/room",
                LocalDate.of(2025,7,24)
        );
    
    
    }
}