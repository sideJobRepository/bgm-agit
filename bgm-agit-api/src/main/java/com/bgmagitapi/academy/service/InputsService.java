package com.bgmagitapi.academy.service;

import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;

import java.util.List;

public interface InputsService {
    List<InputsCurriculumGetResponse> getCurriculum(String className);
}
