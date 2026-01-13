package com.bgmagitapi.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class InputsCheckTeacherResponse {

    private String teacher;
    private List<InputsCheckRowResponse> progresses;
}