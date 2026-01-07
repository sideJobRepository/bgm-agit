package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.dto.response.CurriculumGetResponse;
import com.bgmagitapi.academy.dto.response.QCurriculumGetResponse;
import com.bgmagitapi.academy.dto.response.QCurriculumGetResponse_MonthContent;
import com.bgmagitapi.academy.dto.response.QCurriculumGetResponse_Row;
import com.bgmagitapi.academy.entity.*;
import com.bgmagitapi.academy.repository.query.CurriculumQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.academy.entity.QCurriculum.*;
import static com.bgmagitapi.academy.entity.QCurriculumCont.*;
import static com.bgmagitapi.academy.entity.QCurriculumProgress.*;

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
