package com.bgmagitapi.kml.lecture.repository.impl;

import com.bgmagitapi.kml.lecture.repository.query.LectureQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class LectureRepositoryImpl implements LectureQueryRepository {

    private final JPAQueryFactory queryFactory;
}
