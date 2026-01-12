package com.bgmagitapi.academy.repository.query;

import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.entity.ProgressInputs;

import java.time.LocalDate;
import java.util.List;

public interface InputsQueryRepository {
    List<InputsCurriculumGetResponse> findByCurriculum(String className, Integer year,Integer month);
    
    List<ProgressInputs> findByInputs(String className, LocalDate date, Long curriculumProgressId);
    
    List<ProgressInputs> findByInputsCheck(String className);
    
    List<ProgressInputs> findByCurriculumProgressIds(List<Long> list);
}
