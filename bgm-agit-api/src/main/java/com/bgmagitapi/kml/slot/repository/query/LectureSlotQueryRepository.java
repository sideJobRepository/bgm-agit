package com.bgmagitapi.kml.slot.repository.query;

import com.bgmagitapi.kml.slot.entity.LectureSlot;

import java.time.LocalDate;
import java.time.LocalTime;

public interface LectureSlotQueryRepository {
    LectureSlot findByLectureTime(LocalDate date, LocalTime startTime, LocalTime endTime);
    
    Boolean updateLectureSlotCapacity(Long id);
    
    
}
