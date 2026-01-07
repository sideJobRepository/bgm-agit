package com.bgmagitapi.academy.repository.query;

import com.bgmagitapi.academy.entity.CurriculumCont;

import java.util.List;

public interface CurriculumQueryRepository {

    List<CurriculumCont> findByCurriculum(Long curriculumId);
}
