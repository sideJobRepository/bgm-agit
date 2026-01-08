package com.bgmagitapi.academy.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InputsPutRequest {
    
    private Long id;
    
    private Long curriculumProgressId;
    
    // 입력 반
    private String inputsClasses;
    
    // 입력 선생님
    private String inputsTeacher;
    
    // 입력 과목
    private String inputsSubjects;
    
    // 입력 단원
    private String inputsUnit;
    
    // 입력 페이지
    private String inputsPages;
    
    // 입력 진도
    private String inputsProgress;
    
    // 입력 테스트
    private String inputsTests;
    
    // 입력 과제
    private String inputsHomework;
    
    private String textbook;
    
    // 입력 일시
    private LocalDate inputsDate;
}
