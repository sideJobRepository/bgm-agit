package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.dto.response.QInputsCurriculumGetResponse;
import com.bgmagitapi.academy.repository.query.InputsQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.academy.entity.QCurriculum.curriculum;
import static com.bgmagitapi.academy.entity.QCurriculumProgress.curriculumProgress;

@RequiredArgsConstructor
public class InputsRepositoryImpl implements InputsQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<InputsCurriculumGetResponse> findByCurriculum(String className) {
        return queryFactory
                .select(new QInputsCurriculumGetResponse(
                        curriculum.years,
                        curriculum.classes,
                        curriculumProgress.progressGubun
                ))
                .from(curriculumProgress)
                .join(curriculumProgress.curriculum , curriculum)
                .where(curriculum.classes.eq(className))
                .fetch();
    }
}
