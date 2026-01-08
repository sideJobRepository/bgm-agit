package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.academy.dto.request.InputsPostRequest;
import com.bgmagitapi.academy.dto.request.InputsPutRequest;
import com.bgmagitapi.academy.dto.response.InputGetResponse;
import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.service.InputsService;
import com.bgmagitapi.apiresponse.ApiResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class InputsServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private InputsService inputsService;
    
    @DisplayName("")
    @Test
    void test1() {
        List<InputsCurriculumGetResponse> curriculum = inputsService.getCurriculum("3g");
        System.out.println("curriculum = " + curriculum);
    }
    
    @DisplayName("")
    @Test
    void test2() {
        InputsPostRequest request = InputsPostRequest
                .builder()
                .curriculumProgressId(1L)
                .inputsClasses("3g")
                .inputsTeacher("박지수")
                .inputsSubjects("수학")
                .inputsUnit("단원")
                .inputsPages("73페이지")
                .inputsProgress("입력진도")
                .inputsTests("시험보자")
                .inputsHomework("숙제 많이해와라")
                .inputsDate(LocalDate.now())
                .build();
        
        ApiResponse inputs = inputsService.createInputs(request);
    }
    
    @DisplayName("")
    @Test
    void test3() {
        List<InputGetResponse> inputs = inputsService.getInputs("3g");
        System.out.println("inputs = " + inputs);
    }
    
    @DisplayName("")
    @Test
    void test4() {
        InputsPutRequest request = InputsPutRequest
                .builder()
                .id(1L)
                .curriculumProgressId(2L)
                .inputsClasses("3g")
                .inputsTeacher("박sd지수")
                .inputsSubjects("ssd수학")
                .inputsUnit("단sd원")
                .inputsPages("73페이지")
                .inputsProgress("dddd")
                .inputsTests("ddd")
                .inputsHomework("sdsd숙제 많이해와라")
                .inputsDate(LocalDate.now())
                .build();
        
        ApiResponse apiResponse = inputsService.modifyInputs(request);
        System.out.println("apiResponse = " + apiResponse);
    }
}