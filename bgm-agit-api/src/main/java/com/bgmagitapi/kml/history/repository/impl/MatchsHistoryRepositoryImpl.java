package com.bgmagitapi.kml.history.repository.impl;

import com.bgmagitapi.kml.history.repository.query.MatchsHistoryQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class MatchsHistoryRepositoryImpl implements MatchsHistoryQueryRepository {

    private final JPAQueryFactory queryFactory;
}
