package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationModifyRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.origin.controller.response.reservation.GroupedReservationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface BgmAgitReservationService {
    
    BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id,LocalDate date);
    
    ApiResponse createReservation(BgmAgitReservationCreateRequest request, Long jwt);
    
    Page<GroupedReservationResponse> getReservationDetail(Long memberId, String role, String startDate, String endDate, Pageable pageable);
    
    ApiResponse modifyReservation(Long id, BgmAgitReservationModifyRequest request, String role);
}
