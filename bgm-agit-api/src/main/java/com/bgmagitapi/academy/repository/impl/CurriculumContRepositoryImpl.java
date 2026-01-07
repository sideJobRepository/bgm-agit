package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.entity.CurriculumCont;
import com.bgmagitapi.academy.entity.QCurriculumCont;
import com.bgmagitapi.academy.repository.query.CurriculumContQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.academy.entity.QCurriculumCont.*;

@RequiredArgsConstructor
public class CurriculumContRepositoryImpl implements CurriculumContQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<CurriculumCont> findByCurriculumId(Long curriculumId) {
        return queryFactory
                        .selectFrom(curriculumCont)
                        .where(curriculumCont.curriculumProgress.curriculum.id.eq(curriculumId))
                        .fetch();
    }
}
