package com.bgmagitapi.kml.lecture.service.impl;

import com.bgmagitapi.kml.lecture.dto.response.LectureGetResponse;
import com.bgmagitapi.kml.lecture.service.LectureService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Transactional
@RequiredArgsConstructor
@Service
public class LectureServiceImpl implements LectureService {
    
    
    @Override
    public LectureGetResponse getLectureGetResponse(int year,int month) {
    
        List<LectureGetResponse.TimeSlotByDate> result = new ArrayList<>();
    
        LocalDate today = LocalDate.now();
    
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
    
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
    
            // 오늘 이전이면 스킵
            if (date.isBefore(today)) continue;
    
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            List<String> timeSlots = new ArrayList<>();
    
            // 토요일
            if (dayOfWeek == DayOfWeek.SATURDAY) {
                timeSlots.add("18:00~20:00");
                timeSlots.add("20:00~22:00");
            }
    
            // 일요일
            if (dayOfWeek == DayOfWeek.SUNDAY) {
                timeSlots.add("14:00~16:00");
                timeSlots.add("16:00~18:00");
                timeSlots.add("18:00~20:00");
                timeSlots.add("20:00~22:00");
            }
    
            if (!timeSlots.isEmpty()) {
                result.add(new LectureGetResponse.TimeSlotByDate(date, timeSlots));
            }
        }
    
        return new LectureGetResponse(result);
    }
}
