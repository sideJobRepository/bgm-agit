package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.dto.response.InputGetResponse;
import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.dto.response.QInputGetResponse;
import com.bgmagitapi.academy.dto.response.QInputsCurriculumGetResponse;
import com.bgmagitapi.academy.entity.*;
import com.bgmagitapi.academy.repository.query.InputsQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.academy.entity.QCurriculum.curriculum;
import static com.bgmagitapi.academy.entity.QCurriculumCont.*;
import static com.bgmagitapi.academy.entity.QCurriculumProgress.curriculumProgress;
import static com.bgmagitapi.academy.entity.QInputs.*;

@RequiredArgsConstructor
public class InputsRepositoryImpl implements InputsQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<InputsCurriculumGetResponse> findByCurriculum(String className, Integer year) {
        return queryFactory
                .select(new QInputsCurriculumGetResponse(
                        curriculum.years,
                        curriculum.classes,
                        curriculumProgress.progressGubun
                ))
                .from(curriculumProgress)
                .join(curriculumProgress.curriculum, curriculum)
                .where(curriculum.classes.eq(className) , curriculum.years.eq(year))
                .fetch();
    }
    
    @Override
    public List<InputGetResponse> findByInputs(String className) {
        return queryFactory
                .select(
                        new QInputGetResponse(
                                inputs.id,
                                curriculumProgress.id,
                                inputs.classes,
                                inputs.teacher,
                                inputs.subjects,
                                inputs.unit,
                                inputs.pages,
                                inputs.progress,
                                inputs.tests,
                                inputs.homework,
                                inputs.inputsDate,
                                inputs.progress
                        )
                )
                .from(inputs)
                .join(inputs.curriculumProgress, curriculumProgress)
                .where(inputs.classes.eq(className))
                .fetch();
    }
    
    @Override
    public List<CurriculumCont> findByInputsCheck(String className) {
        return queryFactory
                .select(curriculumCont)
                .from(curriculumCont)
                .join(curriculumCont.curriculumProgress, curriculumProgress).fetchJoin()
                .join(curriculumProgress.curriculum, curriculum).fetchJoin()
                .fetch();
    }
    
    @Override
    public List<Inputs> findByCurriculumProgressIds(List<Long> list) {
        return queryFactory
                .selectFrom(inputs)
                .where(inputs.curriculumProgress.id.in(list))
                .fetch();
    }
}
