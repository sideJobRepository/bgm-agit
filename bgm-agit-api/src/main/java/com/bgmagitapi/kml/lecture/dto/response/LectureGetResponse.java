package com.bgmagitapi.kml.lecture.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;


@AllArgsConstructor
public class LectureGetResponse {
    
    private List<TimeSlotByDate> timeSlot;
    

    
    @Getter
    @AllArgsConstructor
    public static class TimeSlotByDate {
        private LocalDate date;
        private List<String> timeSlots;
    }
}
