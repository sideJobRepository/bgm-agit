package com.bgmagitapi.repository.impl;

import com.bgmagitapi.controller.response.BgmAgitFreeGetResponse;
import com.bgmagitapi.entity.QBgmAgitCommonFile;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.repository.custom.BgmAgitFreeCustomRepository;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitCommonComment.bgmAgitCommonComment;
import static com.bgmagitapi.entity.QBgmAgitFree.bgmAgitFree;

@RequiredArgsConstructor
public class BgmAgitFreeRepositoryImpl implements BgmAgitFreeCustomRepository {

    private final JPAQueryFactory queryFactory;
    
    @Override
    public Page<BgmAgitFreeGetResponse> findByAllBgmAgitFree(Pageable pageable) {
        
        List<BgmAgitFreeGetResponse> result = queryFactory
                .select(Projections.constructor(
                        BgmAgitFreeGetResponse.class,
                        bgmAgitFree.bgmAgitFreeId,
                        bgmAgitFree.bgmAgitFreeTitle,
                        bgmAgitFree.bgmAgitFreeCont,
                        bgmAgitFree.bgmAgitMember.bgmAgitMemberId,
                        bgmAgitCommonComment.count()
                ))
                .from(bgmAgitFree)
                .leftJoin(bgmAgitCommonComment)
                .on(bgmAgitCommonComment.targetId.eq(bgmAgitFree.bgmAgitFreeId).and(bgmAgitCommonComment.bgmAgitCommonType.eq(BgmAgitCommonType.FREE)))
                .groupBy(bgmAgitFree.bgmAgitFreeId)
                .orderBy(bgmAgitFree.bgmAgitFreeId.desc())
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .fetch();
        
        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitFree.count())
                .from(bgmAgitFree);
        
        return PageableExecutionUtils.getPage(result,pageable,countQuery::fetchOne);
    }
}
