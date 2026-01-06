package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.repository.query.CurriculumContQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CurriculumContRepositoryImpl implements CurriculumContQueryRepository {

    private final JPAQueryFactory queryFactory;
}
