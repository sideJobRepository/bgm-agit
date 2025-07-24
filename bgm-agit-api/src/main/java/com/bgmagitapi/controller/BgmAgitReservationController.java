package com.bgmagitapi.controller;


import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.service.BgmAgitReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitReservationController {
    
    
    private final BgmAgitReservationService bgmAgitReservationService;
    
    @GetMapping("/reservation/{labelGb}/{link}/{date}")
    public List<BgmAgitReservationResponse> getReservation(
            @PathVariable("labelGb") Long labelGb,
            @PathVariable("link") String link,
            @PathVariable("date") String dateStr) {
        LocalDate date = LocalDate.parse(dateStr.substring(0, 10));
        return bgmAgitReservationService.getReservation(labelGb, link, date);
    }
}
