package com.bgmagitapi.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
@Data
public class InputsCheckRowResponse {

    private String teacher;
    private String className;
    private String progressGubun;
    private List<WeekCheck> weeks;

    @AllArgsConstructor
    @Data
    public static class WeekCheck {
        private LocalDate startDate;
        private LocalDate endDate;
        private CheckItem startItem; // 월/수/금
        private CheckItem endItem;   // 화/목/토
    }

    @AllArgsConstructor
    @Data
    public static class CheckItem {
        private LocalDate date;
        private String curriculumContent;
        private String content;
    }
}