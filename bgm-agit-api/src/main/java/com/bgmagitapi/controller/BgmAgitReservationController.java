package com.bgmagitapi.controller;



import com.bgmagitapi.controller.response.ReservationAvailabilityResponse;
import com.bgmagitapi.service.BgmAgitReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitReservationController {
    
    
    private final BgmAgitReservationService bgmAgitReservationService;

    @GetMapping("/reservation")
    public ReservationAvailabilityResponse getReservation(
            @RequestParam(name = "labelGb") Long labelGb,
            @RequestParam(name = "link") String link,
            @RequestParam(name = "date") String dateStr) {
        LocalDate date = LocalDate.parse(dateStr.substring(0, 10));
        return bgmAgitReservationService.getReservation(labelGb,link,date);
    }
}
