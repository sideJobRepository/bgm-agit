package com.bgmagitapi.kml.lecture.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.lecture.dto.request.LecturePostRequest;
import com.bgmagitapi.kml.lecture.dto.response.LectureGetResponse;
import com.bgmagitapi.kml.lecture.service.LectureService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LectureServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private LectureService lectureService;
    
    @DisplayName("")
    @Test
    void test() {
        LectureGetResponse lectureGetResponse = lectureService.getLectureGetResponse(2026, 2,20,1L);
        System.out.println("lectureGetResponse = " + lectureGetResponse);
    }
    
    @DisplayName("")
    @Test
    void test2() {
        
        LocalDate localDate = LocalDate.of(2026, 2, 22);
        LecturePostRequest request = new LecturePostRequest(localDate, "16:00~18:00");
        
        List<Long> longs = List.of(1L);
        
        for (Long aLong : longs) {
            ApiResponse lecture = lectureService.createLecture(request, aLong);
            System.out.println("lecture = " + lecture);
        }
    }
}