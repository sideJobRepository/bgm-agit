package com.bgmagitapi.academy.repository.query;

import com.bgmagitapi.academy.dto.response.InputGetResponse;
import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.entity.CurriculumCont;
import com.bgmagitapi.academy.entity.Inputs;
import com.bgmagitapi.academy.entity.ProgressInputs;

import java.time.LocalDate;
import java.util.List;

public interface InputsQueryRepository {
    List<InputsCurriculumGetResponse> findByCurriculum(String className, Integer year);
    
    List<ProgressInputs> findByInputs(String className, LocalDate date);
    
    List<CurriculumCont> findByInputsCheck(String className);
    
    List<Inputs> findByCurriculumProgressIds(List<Long> list);
}
