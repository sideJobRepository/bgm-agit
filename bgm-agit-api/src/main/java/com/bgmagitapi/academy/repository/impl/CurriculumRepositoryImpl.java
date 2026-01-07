package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.entity.CurriculumCont;
import com.bgmagitapi.academy.repository.query.CurriculumQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.academy.entity.QCurriculum.curriculum;
import static com.bgmagitapi.academy.entity.QCurriculumCont.curriculumCont;
import static com.bgmagitapi.academy.entity.QCurriculumProgress.curriculumProgress;

@RequiredArgsConstructor
public class CurriculumRepositoryImpl implements CurriculumQueryRepository {

    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<CurriculumCont> findByCurriculum(Integer year, String className) {
        return queryFactory
                .selectFrom(curriculumCont)
                .join(curriculumCont.curriculumProgress , curriculumProgress)
                .join(curriculumProgress.curriculum , curriculum)
                .where(curriculum.years.eq(year) , curriculum.classes.eq(className))
                .fetch();
    }
}
