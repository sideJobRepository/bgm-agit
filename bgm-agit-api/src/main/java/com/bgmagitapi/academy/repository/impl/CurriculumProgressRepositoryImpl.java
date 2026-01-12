package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.entity.CurriculumProgress;
import com.bgmagitapi.academy.entity.ProgressInputs;
import com.bgmagitapi.academy.entity.QCurriculumProgress;
import com.bgmagitapi.academy.entity.QProgressInputs;
import com.bgmagitapi.academy.repository.query.CurriculumProgressQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.academy.entity.QCurriculumProgress.*;
import static com.bgmagitapi.academy.entity.QProgressInputs.*;

@RequiredArgsConstructor
public class CurriculumProgressRepositoryImpl implements CurriculumProgressQueryRepository {

    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<CurriculumProgress> findByCurriculumId(Long curriculumId) {
        return queryFactory
                .selectFrom(curriculumProgress)
                .where(curriculumProgress.curriculum.id.eq(curriculumId))
                .fetch();
    }
    
    @Override
    public List<ProgressInputs> findBycurriculumProgress(Long id) {
        return queryFactory
                .selectFrom(progressInputs)
                .where(progressInputs.inputs.id.eq(id))
                .fetch();
    }
}
