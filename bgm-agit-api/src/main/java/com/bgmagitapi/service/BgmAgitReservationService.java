package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitReservationModifyRequest;
import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.controller.response.reservation.GroupedReservationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface BgmAgitReservationService {
    
    BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id,LocalDate date);
    
    ApiResponse createReservation(BgmAgitReservationCreateRequest request, Long jwt);
    
    Page<GroupedReservationResponse> getReservationDetail(Long memberId, Pageable pageable);
    
    ApiResponse modifyReservation(Long id, BgmAgitReservationModifyRequest request);
}
