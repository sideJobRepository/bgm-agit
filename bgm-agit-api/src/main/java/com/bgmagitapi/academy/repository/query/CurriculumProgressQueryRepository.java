package com.bgmagitapi.academy.repository.query;

import com.bgmagitapi.academy.entity.CurriculumProgress;
import com.bgmagitapi.academy.entity.ProgressInputs;

import java.util.List;

public interface CurriculumProgressQueryRepository {
    List<CurriculumProgress> findByCurriculumId(Long curriculumId);
    
    List<ProgressInputs> findBycurriculumProgress(Long id);
    
}
