package com.bgmagitapi.repository.impl;

import com.bgmagitapi.repository.custom.BgmAgitFreeCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class BgmAgitFreeRepositoryImpl implements BgmAgitFreeCustomRepository {

    private final JPAQueryFactory queryFactory;
}
