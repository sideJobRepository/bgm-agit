package com.bgmagitapi.academy.repository.impl;

import com.bgmagitapi.academy.repository.query.ProgressInputsQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ProgressInputsRepositoryImpl implements ProgressInputsQueryRepository {

    private final JPAQueryFactory queryFactory;
}
