package com.bgmagitapi.controller.response.reservation;

import lombok.*;

import java.time.LocalDate;
import java.util.List;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class GroupedReservationResponse {
    private Long reservationNo;
    private LocalDate reservationDate;
    
    private String approvalStatus;
    private String cancelStatus;
    private String reservationMemberName;
    private String reservationAddr;
    private Integer reservationPeople;
    private String reservationRequest;
    
    private List<TimeSlot> timeSlots;
    
    @Getter
    @Setter
    public static class TimeSlot {
        private String startTime;
        private String endTime;
        
        public TimeSlot(String startTime, String endTime) {
            this.startTime = startTime;
            this.endTime = endTime;
        }
    }
}
