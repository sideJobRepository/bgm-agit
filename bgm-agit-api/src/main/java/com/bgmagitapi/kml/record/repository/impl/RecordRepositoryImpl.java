package com.bgmagitapi.kml.record.repository.impl;

import com.bgmagitapi.kml.record.repository.query.RecordQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class RecordRepositoryImpl implements RecordQueryRepository {

    private final JPAQueryFactory queryFactory;
}
