package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.dto.response.QInputsCurriculumGetResponse;
import com.bgmagitapi.academy.entity.*;
import com.bgmagitapi.academy.repository.query.InputsQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import static com.bgmagitapi.academy.entity.QCurriculum.curriculum;
import static com.bgmagitapi.academy.entity.QCurriculumCont.curriculumCont;
import static com.bgmagitapi.academy.entity.QCurriculumProgress.curriculumProgress;
import static com.bgmagitapi.academy.entity.QInputs.inputs;
import static com.bgmagitapi.academy.entity.QProgressInputs.progressInputs;

@RequiredArgsConstructor
public class InputsRepositoryImpl implements InputsQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<InputsCurriculumGetResponse> findByCurriculum(String className, Integer year, Integer month) {
        return queryFactory
                .select(new QInputsCurriculumGetResponse(
                                        curriculumProgress.id,
                                        curriculum.years,
                                        curriculum.classes,
                                        curriculumProgress.progressGubun
                                ))
                .from(curriculumCont)
                .join(curriculumCont.curriculumProgress, curriculumProgress)
                .where(
                        
                        curriculum.classes.eq(className), curriculum.years.eq(year),
                        curriculumCont.startMonths.loe(month)
                        .and(curriculumCont.endMonths.goe(month))
                )
                .fetch();
    }
    
    @Override
    public List<ProgressInputs> findByInputs(String className, LocalDate date, Long curriculumProgressId) {
        return queryFactory
                .select(
                        progressInputs
                )
                .from(progressInputs)
                .join(progressInputs.curriculumProgress, curriculumProgress).fetchJoin()
                .join(progressInputs.inputs, inputs).fetchJoin()
                .where(inputs.classes.eq(className), inputs.inputsDate.eq(date), progressInputs.curriculumProgress.id.eq(curriculumProgressId))
                .fetch();
    }
    
    @Override
    public List<ProgressInputs> findByInputsCheck(String className) {
         return queryFactory.
                selectFrom(progressInputs)
                        .join(progressInputs.inputs, inputs).fetchJoin()
                         .join(progressInputs.curriculumProgress, curriculumProgress).fetchJoin()
                         .join(curriculumProgress.curriculum, curriculum).fetchJoin()
                 .where(curriculum.classes.eq(className)).fetch();
    }
    
    @Override
    public List<ProgressInputs> findByCurriculumProgressIds(List<Long> list) {
        return queryFactory
                .selectFrom(progressInputs)
                .where(progressInputs.curriculumProgress.id.in (list))
                .fetch();
    }
}
