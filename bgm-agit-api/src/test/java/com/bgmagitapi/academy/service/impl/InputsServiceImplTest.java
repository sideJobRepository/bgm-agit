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

class InputsServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private InputsService inputsService;
    
    @DisplayName("")
    @Test
    void test1() {
        List<InputsCurriculumGetResponse> curriculum = inputsService.getCurriculum("3g", 2026);
        System.out.println("curriculum = " + curriculum);
    }
    
    @DisplayName("")
    @Test
    void test2() {
        
        
        InputsPostRequest.ProgressInputsRequest result1 = InputsPostRequest.ProgressInputsRequest
                .builder()
                .curriculumProgressId(1L)
                .textbook("교재다다")
                .inputsUnit("2단원")
                .inputsPages("3페이지")
                .build();
        
        
        InputsPostRequest.ProgressInputsRequest result2 = InputsPostRequest.ProgressInputsRequest
                .builder()
                .curriculumProgressId(2L)
                .textbook("교재ㅇㅇㅇㅇ다다")
                .inputsUnit("3단원")
                .inputsPages("4페이지")
                .build();
        
        List<InputsPostRequest.ProgressInputsRequest> list = List.of(result1, result2);
        
        InputsPostRequest request = InputsPostRequest
                .builder()
                .inputsClasses("3g")
                .inputsTeacher("박지수")
                .inputsSubjects("수학")
                .inputsProgress("입력진도")
                .inputsTests("시험보자")
                .inputsHomework("숙제 많이해와라")
                .progressInputsRequests(list)
                .inputsDate(LocalDate.now())
                .build();
        
        ApiResponse inputs = inputsService.createInputs(request);
        System.out.println("inputs = " + inputs);
    }
    
    @DisplayName("")
    @Test
    void test3() {
        LocalDate date = LocalDate.now();
        InputGetResponse inputs = inputsService.getInputs("3g",date);
        System.out.println("inputs = " + inputs);
    }
    
    @DisplayName("")
    @Test
    void test4() {
        InputsPutRequest request = InputsPutRequest.builder()
                .id(4L)
                .curriculumProgressId(2L)
                .inputsClasses("3g")
                .inputsTeacher("박sd지수")
                .inputsSubjects("ssd수학")
                .inputsProgress("dddd")
                .inputsTests("ddd")
                .inputsHomework("sdsd숙제 많이해와라")
                .inputsDate(LocalDate.now())
                .progressItems(List.of(
                        InputsPutRequest.ProgressItem.builder()
                                .textbook("수학1")
                                .unit("2단원")
                                .pages("3페이지")
                                .build(),
                        InputsPutRequest.ProgressItem.builder()
                                .textbook("수학1")
                                .unit("3단원")
                                .pages("4페이지")
                                .build()
                ))
                .build();
    
        ApiResponse apiResponse = inputsService.modifyInputs(request);
    
        System.out.println("apiResponse = " + apiResponse);
    }
}