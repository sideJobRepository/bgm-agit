package com.bgmagitapi.controller.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReservationAvailabilityResponse {
    
    
    private List<TimeSlotByDate> timeSlots;
    private List<PriceByDate> prices;
 
    
    @Getter
    @AllArgsConstructor
    public static class TimeSlotByDate {
        private LocalDate date;
        private String label;
        private String group;
        private List<String> timeSlots;
    }
    
    @Getter
    @AllArgsConstructor
    public static class PriceByDate {
        private LocalDate date;
        private Integer price;
    }
}
