package com.bgmagitapi.academy.repository.query;

import com.querydsl.core.Tuple;

import java.util.List;

public interface CurriculumQueryRepository {

    List<Tuple> findByCurriculum(Integer year , String className);
}
