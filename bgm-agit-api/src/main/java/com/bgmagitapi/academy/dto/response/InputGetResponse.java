package com.bgmagitapi.academy.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InputGetResponse {
    private Long id;
    private Long curriculumProgressId;
    private String classesName;
    private String teacher;
    private String subjects;
    private String progress;
    private String tests;
    private String homework;
    private LocalDate inputsDate;
    
    private List<ProgressItem> progressItems;
    
    @QueryProjection
    public InputGetResponse(Long id, Long curriculumProgressId, String classesName, String teacher, String subjects, String progress, String tests, String homework, LocalDate inputsDate) {
        this.id = id;
        this.curriculumProgressId = curriculumProgressId;
        this.classesName = classesName;
        this.teacher = teacher;
        this.subjects = subjects;
        this.progress = progress;
        this.tests = tests;
        this.homework = homework;
        this.inputsDate = inputsDate;
    }
    
    public List<ProgressItem> getProgressItems() {
        if (this.progressItems == null) {
            this.progressItems = new ArrayList<>();
        }
        return this.progressItems;
    }
    
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProgressItem {
        private Long id;
        private String textBook;
        private String unit;
        private String pages;
    }
}
