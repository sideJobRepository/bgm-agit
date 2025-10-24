package com.bgmagitapi.repository.impl;

import com.bgmagitapi.repository.custom.BgmAgitCommonFileCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class BgmAgitCommonFileRepositoryImpl implements BgmAgitCommonFileCustomRepository {
    
    private final JPAQueryFactory queryFactory;
}
