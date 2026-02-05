package com.bgmagitapi.kml.history.repository.impl;

import com.bgmagitapi.kml.history.repository.query.RecordHistoryQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class RecordHistoryRepositoryImpl implements RecordHistoryQueryRepository {

    private final JPAQueryFactory queryFactory;
}
