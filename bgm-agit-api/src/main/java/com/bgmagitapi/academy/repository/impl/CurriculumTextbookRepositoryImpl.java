package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.repository.query.CurriculumTextbookQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CurriculumTextbookRepositoryImpl implements CurriculumTextbookQueryRepository {

    private final JPAQueryFactory queryFactory;
}
