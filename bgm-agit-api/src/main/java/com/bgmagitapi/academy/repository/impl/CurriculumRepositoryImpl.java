package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.entity.CurriculumCont;
import com.bgmagitapi.academy.entity.QCurriculum;
import com.bgmagitapi.academy.entity.QCurriculumCont;
import com.bgmagitapi.academy.entity.QCurriculumProgress;
import com.bgmagitapi.academy.repository.query.CurriculumQueryRepository;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class CurriculumRepositoryImpl implements CurriculumQueryRepository {

    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<Tuple> findByCurriculum(Integer year, String className) {
        QCurriculum curriculum = QCurriculum.curriculum;
     QCurriculumProgress progress = QCurriculumProgress.curriculumProgress;
     QCurriculumCont cont = QCurriculumCont.curriculumCont;
 
     return queryFactory
             .select(
                     curriculum,
                     progress,
                     cont
             )
             .from(progress)
             .leftJoin(progress.curriculum, curriculum)
             .leftJoin(cont)
                 .on(cont.curriculumProgress.id.eq(progress.id))
             .where(
                     curriculum.years.eq(year),
                     curriculum.classes.eq(className)
             )
             .orderBy(
                     progress.id.asc(),
                     cont.startMonths.asc().nullsLast()
             )
             .fetch();
    }
}
