package com.bgmagitapi.repository.impl;

import com.bgmagitapi.repository.custom.BgmAgitCommonCommentCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class BgmAgitCommonCommentRepositoryImpl implements BgmAgitCommonCommentCustomRepository {

    private final JPAQueryFactory queryFactory;
}
