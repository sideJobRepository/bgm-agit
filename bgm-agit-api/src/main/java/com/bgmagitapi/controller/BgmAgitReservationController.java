package com.bgmagitapi.controller;



import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.service.BgmAgitReservationService;
import org.springframework.security.oauth2.jwt.Jwt;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

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
        return bgmAgitReservationService.getReservation(labelGb,link,id,date);
    }
    
    @PostMapping("/reservation")
    public ApiResponse createReservation(@RequestBody BgmAgitReservationCreateRequest request, @AuthenticationPrincipal Jwt jwt) {
        return bgmAgitReservationService.createReservation(request,jwt);
    }
}
