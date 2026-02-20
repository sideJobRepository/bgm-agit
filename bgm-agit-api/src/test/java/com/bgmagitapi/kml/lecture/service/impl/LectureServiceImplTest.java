package com.bgmagitapi.kml.lecture.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.kml.lecture.dto.response.LectureGetResponse;
import com.bgmagitapi.kml.lecture.service.LectureService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

class LectureServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private LectureService lectureService;
    
    @DisplayName("")
    @Test
    void test(){
        
        LectureGetResponse lectureGetResponse = lectureService.getLectureGetResponse(2026);
        System.out.println("lectureGetResponse = " + lectureGetResponse);
    }
}