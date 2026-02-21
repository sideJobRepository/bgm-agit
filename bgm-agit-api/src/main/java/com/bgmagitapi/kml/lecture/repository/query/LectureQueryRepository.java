package com.bgmagitapi.kml.lecture.repository.query;

import java.time.LocalDate;
import java.util.List;

public interface LectureQueryRepository {
    
    List<Long> findByReservedSlotIds(LocalDate start, LocalDate end);
    
    boolean existsMyActiveReservation(Long memberId, LocalDate today);
}
