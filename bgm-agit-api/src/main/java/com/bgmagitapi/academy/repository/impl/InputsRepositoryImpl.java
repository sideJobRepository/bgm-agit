package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.dto.response.QInputsCurriculumGetResponse;
import com.bgmagitapi.academy.entity.CurriculumCont;
import com.bgmagitapi.academy.entity.Inputs;
import com.bgmagitapi.academy.entity.ProgressInputs;
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
    public List<InputsCurriculumGetResponse> findByCurriculum(String className, Integer year) {
        return queryFactory
                .select(new QInputsCurriculumGetResponse(
                        curriculumProgress.id,
                        curriculum.years,
                        curriculum.classes,
                        curriculumProgress.progressGubun
                ))
                .from(curriculumProgress)
                .join(curriculumProgress.curriculum, curriculum)
                .where(curriculum.classes.eq(className), curriculum.years.eq(year))
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
                .where(inputs.classes.eq(className), inputs.inputsDate.eq(date) , progressInputs.curriculumProgress.id.eq(curriculumProgressId))
                .fetch();
    }
    
    @Override
    public List<CurriculumCont> findByInputsCheck(String className) {
        return queryFactory
                .select(curriculumCont)
                .from(curriculumCont)
                .join(curriculumCont.curriculumProgress, curriculumProgress)
                .join(curriculumProgress.curriculum, curriculum)
                .where(curriculum.classes.eq(className))
                .fetch();
    }
    
    @Override
    public List<Inputs> findByCurriculumProgressIds(List<Long> list) {
        return null;
//        return queryFactory
//                .selectFrom(inputs)
//                .where(inputs.curriculumProgress.id.in(list))
//                .fetch();
    }
}
