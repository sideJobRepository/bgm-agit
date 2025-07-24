package com.bgmagitapi.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BgmAgitReservationResponse {
    
    
    
    
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate startDate;
    private LocalDate endDate;
    private String label;
    private String group;
    
    private Integer monthPrice;
    
    
    public BgmAgitReservationResponse(LocalTime startTime, LocalTime endTime, LocalDate startDate, LocalDate endDate, String label, String group) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.startDate = startDate;
        this.endDate = endDate;
        this.label = label;
        this.group = group;
    }
}
