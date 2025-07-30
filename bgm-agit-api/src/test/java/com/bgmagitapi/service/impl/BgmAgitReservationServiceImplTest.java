package com.bgmagitapi.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.controller.response.reservation.GroupedReservationResponse;
import com.bgmagitapi.service.BgmAgitReservationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;

class BgmAgitReservationServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private BgmAgitReservationService bgmAgitReservationService;
    
    
    
    @DisplayName("")
    @Test
    void test1() throws JsonProcessingException {
        
        
        BgmAgitReservationResponse reservation = bgmAgitReservationService.getReservation(
                3L,
                "/detail/room",
                18L,
                LocalDate.of(2025, 7,24)
        );
        
        String s = objectMapper.writeValueAsString(reservation);
        System.out.println(s);
    }
    
    @DisplayName("")
    @Test
    void test2(){
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "bgmAgitReservationId"));
        Page<GroupedReservationResponse> reservationDetail = bgmAgitReservationService.getReservationDetail(6L, "ROLE_USER", null, null, pageable);
        System.out.println("reservationDetail = " + reservationDetail);
    }
    @DisplayName("")
    @Test
    void test3(){
        Long userId = 1L;
        Long imageId = 14L;
        String dateString = "2025-07-30T15:00:00.000Z";
        //List<String> times = List.of("13:00", "14:00", "15:00","16:00");
        List<String> times = List.of("15:00","16:00");
        
        BgmAgitReservationCreateRequest request = new BgmAgitReservationCreateRequest();
        request.setBgmAgitReservationStartDate(dateString);
        request.setStartTimeEndTime(times);
        request.setBgmAgitReservationType("ROOM");
        request.setBgmAgitImageId(imageId);
        
        bgmAgitReservationService.createReservation(
                request,
                userId
        );
    }
    
    @DisplayName("")
    @Test
    void test(){
        Long userId = 1L;
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "bgmAgitReservationId"));
        Page<GroupedReservationResponse> reservationDetail = bgmAgitReservationService.getReservationDetail(userId, "ROLE_ADMIN", "2025-07-30", "2025-08-30", pageable);
        System.out.println("reservationDetail = " + reservationDetail);
    }
}