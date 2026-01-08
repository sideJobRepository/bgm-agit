package com.bgmagitapi.academy.repository.query;

import com.bgmagitapi.academy.dto.response.InputGetResponse;
import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.entity.CurriculumCont;
import com.bgmagitapi.academy.entity.Inputs;

import java.util.List;

public interface InputsQueryRepository {
    List<InputsCurriculumGetResponse> findByCurriculum(String className, Integer year);
    
    List<InputGetResponse> findByInputs(String className);
    
    List<CurriculumCont> findByInputsCheck(String className);
    
    List<Inputs> findByCurriculumProgressIds(List<Long> list);
}
