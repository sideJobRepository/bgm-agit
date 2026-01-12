package com.bgmagitapi.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class InputsCheckDateHeader {
    
  
    private int month;
    private List<WeekGroup> weekGroups;
    private List<InputsCheckClassResponse> rows;

    @Getter
    @AllArgsConstructor
    public static class WeekGroup {
        private LocalDate startDate;
        private LocalDate endDate;
        private String label;
    }
    
}
