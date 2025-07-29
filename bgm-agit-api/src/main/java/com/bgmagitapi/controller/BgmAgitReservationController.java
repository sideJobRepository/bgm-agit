package com.bgmagitapi.controller;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.response.BgmAgitReservationDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.service.BgmAgitReservationService;
import lombok.Getter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.oauth2.jwt.Jwt;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitReservationController {
    
    
    private final BgmAgitReservationService bgmAgitReservationService;
    
    @GetMapping("/reservation")
    public BgmAgitReservationResponse getReservation(
            @RequestParam(name = "labelGb") Long labelGb,
            @RequestParam(name = "link") String link,
            @RequestParam(name = "id") Long id,
            @RequestParam(name = "date") String dateStr) {
        LocalDate date = LocalDate.parse(dateStr.substring(0, 10));
        return bgmAgitReservationService.getReservation(labelGb, link, id, date);
    }
    
    @PostMapping("/reservation")
    public ApiResponse createReservation(@RequestBody BgmAgitReservationCreateRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("id");
        return bgmAgitReservationService.createReservation(request, userId);
    }
    
    @GetMapping("/reservation/detail")
    public Page<BgmAgitReservationDetailResponse> getReservationDetail(@AuthenticationPrincipal Jwt jwt, @PageableDefault(size = 10, sort = "bgmAgitReservationId", direction = Sort.Direction.DESC) Pageable pageable) {
        Long id = jwt.getClaim("id");
        return bgmAgitReservationService.getReservationDetail(id, pageable);
    }
}
