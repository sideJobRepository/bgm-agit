package com.bgmagitapi.academy.repository.query;

import com.bgmagitapi.academy.dto.response.InputGetResponse;
import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;

import java.util.List;

public interface InputsQueryRepository {
    List<InputsCurriculumGetResponse> findByCurriculum(String className);
    
    List<InputGetResponse> findByInputs(String className);
    
}
