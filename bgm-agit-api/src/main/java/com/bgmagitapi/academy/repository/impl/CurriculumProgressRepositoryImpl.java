package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.repository.query.CurriculumProgressQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CurriculumProgressRepositoryImpl implements CurriculumProgressQueryRepository {

    private final JPAQueryFactory queryFactory;
}
