package com.bgmagitapi.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InputsCheckClassResponse {
    private String className;
    private List<InputsCheckTeacherResponse> teachers;
}
