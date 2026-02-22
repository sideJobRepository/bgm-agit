package com.bgmagitapi.kml.lecture.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;


@AllArgsConstructor
@Getter
public class LectureGetResponse {
    
    private List<TimeSlotByDate> timeSlot;
    

    
    @Getter
    @AllArgsConstructor
    public static class TimeSlotByDate {
        private LocalDate date;
        private List<SlotItem> timeSlots;
    }
    @Getter
    @AllArgsConstructor
    public static class SlotItem {
        private String time;      // "18:00~20:00"
        private boolean enabled;  // true/false (비활성화 내려주기)
    }
}
