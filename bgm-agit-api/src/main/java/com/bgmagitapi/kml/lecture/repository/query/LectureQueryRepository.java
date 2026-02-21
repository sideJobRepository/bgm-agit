package com.bgmagitapi.kml.lecture.repository.query;

import com.bgmagitapi.kml.my.dto.response.MyAcademyGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface LectureQueryRepository {
    
    List<Long> findByReservedSlotIds(LocalDate start, LocalDate end);
    
    boolean existsMyActiveReservation(Long memberId, LocalDate today);
    
    Page<MyAcademyGetResponse> findByMyAcademy(Pageable pageable, Long memberId);
}
