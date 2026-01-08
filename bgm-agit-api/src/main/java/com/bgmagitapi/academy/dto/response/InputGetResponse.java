package com.bgmagitapi.academy.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class InputGetResponse {
    
    private Long id;
    private Long curriculumProgressId;
    private String classesName;
    private String teacher;
    private String subjects;
    private String unit;
    private String pages;
    private String progress;
    private String tests;
    private String homework;
    private LocalDate inputsDate;
    private String progressType;
    
    @QueryProjection
    
    public InputGetResponse(Long id, Long curriculumProgressId, String classesName, String teacher, String subjects, String unit, String pages, String progress, String tests, String homework, LocalDate inputsDate, String progressType) {
        this.id = id;
        this.curriculumProgressId = curriculumProgressId;
        this.classesName = classesName;
        this.teacher = teacher;
        this.subjects = subjects;
        this.unit = unit;
        this.pages = pages;
        this.progress = progress;
        this.tests = tests;
        this.homework = homework;
        this.inputsDate = inputsDate;
        this.progressType = progressType;
    }
}
