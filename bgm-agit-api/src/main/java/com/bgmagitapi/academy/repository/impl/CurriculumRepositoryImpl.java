package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.repository.query.CurriculumQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CurriculumRepositoryImpl implements CurriculumQueryRepository {

    private final JPAQueryFactory queryFactory;
}
