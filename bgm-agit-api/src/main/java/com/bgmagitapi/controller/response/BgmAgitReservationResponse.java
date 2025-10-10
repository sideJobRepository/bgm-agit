package com.bgmagitapi.controller.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BgmAgitReservationResponse {
    
    
    private List<TimeSlotByDate> timeSlots;
    private List<PriceByDate> prices;
    private String label;
    private String group;
    private Integer minPeople;
    private Integer maxPeople;
    
    @Getter
    @AllArgsConstructor
    public static class TimeSlotByDate {
        private LocalDate date;
        private List<String> timeSlots;
        private String message;
    }
    
    @Getter
    @AllArgsConstructor
    public static class PriceByDate {
        private LocalDate date;
        private Integer price;
        private boolean colorGb;
    }
}
