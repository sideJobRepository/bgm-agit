package com.bgmagitapi.kml.notice.repository.impl;

import com.bgmagitapi.kml.notice.repository.query.KmlNoticeQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class KmlNoticeRepositoryImpl implements KmlNoticeQueryRepository {

    private final JPAQueryFactory queryFactory;
}
