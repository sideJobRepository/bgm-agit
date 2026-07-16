package com.bgmagitapi.origin.lecture.repository.query;

import com.bgmagitapi.origin.lecture.entity.Lecture;
import com.bgmagitapi.origin.my.dto.response.MyAcademyGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface LectureQueryRepository {
    
    List<Long> findByReservedSlotIds(LocalDate start, LocalDate end);
    
    boolean existsMyActiveReservation(Long memberId, LocalDate today);
    
    Page<MyAcademyGetResponse> findByMyAcademy(Pageable pageable, Long memberId);
    
    Lecture findByLectureDate(Long lectureId);
}
