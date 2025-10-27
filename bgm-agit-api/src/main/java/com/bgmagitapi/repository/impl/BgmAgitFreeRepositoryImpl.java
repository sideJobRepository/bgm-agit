package com.bgmagitapi.repository.impl;

import com.bgmagitapi.controller.response.BgmAgitFreeGetDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitFreeGetResponse;
import com.bgmagitapi.entity.*;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.repository.custom.BgmAgitFreeCustomRepository;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.bgmagitapi.entity.QBgmAgitCommonComment.*;
import static com.bgmagitapi.entity.QBgmAgitCommonComment.bgmAgitCommonComment;
import static com.bgmagitapi.entity.QBgmAgitCommonFile.*;
import static com.bgmagitapi.entity.QBgmAgitFree.*;
import static com.bgmagitapi.entity.QBgmAgitFree.bgmAgitFree;
import static com.bgmagitapi.entity.QBgmAgitMember.*;

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
                bgmAgitFree.bgmAgitMember.bgmAgitMemberName, // 작성자 이름 추가
                bgmAgitFree.registDate,                      //  등록일 추가
                bgmAgitCommonComment.count()                 // 댓글 수
            ))
            .from(bgmAgitFree)
            .leftJoin(bgmAgitCommonComment)
            .on(bgmAgitCommonComment.targetId.eq(bgmAgitFree.bgmAgitFreeId)
                .and(bgmAgitCommonComment.bgmAgitCommonType.eq(BgmAgitCommonType.FREE)))
            .groupBy(bgmAgitFree.bgmAgitFreeId,
                     bgmAgitFree.bgmAgitMember.bgmAgitMemberId,
                     bgmAgitFree.bgmAgitMember.bgmAgitMemberName,
                     bgmAgitFree.registDate)
            .orderBy(bgmAgitFree.bgmAgitFreeId.desc())
            .limit(pageable.getPageSize())
            .offset(pageable.getOffset())
            .fetch();
        
        JPAQuery<Long> countQuery = queryFactory
            .select(bgmAgitFree.count())
            .from(bgmAgitFree);
        
        return PageableExecutionUtils.getPage(result, pageable, countQuery::fetchOne);
    }
    
    @Override
    public BgmAgitFree findByIdAndMemberId(Long id, BgmAgitMember bgmAgitMember) {
        return queryFactory
                .selectFrom(bgmAgitFree)
                .where(bgmAgitFree.bgmAgitFreeId.eq(id),
                        bgmAgitFree.bgmAgitMember.eq(bgmAgitMember)
                ).fetchFirst();
    }
    
    @Override
    public BgmAgitFreeGetDetailResponse findByFreeDetail(Long id, Long memberId) {
        // 게시글 + 작성자만 조회
        return queryFactory
            .select(Projections.constructor(
                BgmAgitFreeGetDetailResponse.class,
                bgmAgitFree.bgmAgitFreeId,
                bgmAgitMember.bgmAgitMemberId,
                bgmAgitFree.bgmAgitFreeTitle,
                bgmAgitFree.bgmAgitFreeCont
            ))
            .from(bgmAgitFree)
            .join(bgmAgitFree.bgmAgitMember, bgmAgitMember)
            .where(bgmAgitFree.bgmAgitFreeId.eq(id))
            .fetchOne();
    }
    
    public List<BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseFile> findFiles(Long id) {
        return queryFactory.select(Projections.constructor(
                        BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseFile.class,
                        bgmAgitCommonFile.bgmAgitCommonFileName,
                        bgmAgitCommonFile.bgmAgitCommonFileUuidName,
                        bgmAgitCommonFile.bgmAgitCommonFileUrl
                ))
                .from(bgmAgitCommonFile)
                .where(bgmAgitCommonFile.bgmAgitCommonFileTargetId.eq(id))
                .fetch();
    }
    
    public List<BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseComment> findComments(Long id, Long memberId) {
        return queryFactory.select(Projections.constructor(
                        BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseComment.class,
                        bgmAgitCommonComment.id.stringValue(),
                        bgmAgitCommonComment.member.bgmAgitMemberName,
                        bgmAgitCommonComment.content,
                        bgmAgitCommonComment.depth,
                        Expressions.cases()
                            .when(memberId != null
                                ? bgmAgitCommonComment.member.bgmAgitMemberId.eq(memberId)
                                : Expressions.FALSE)
                            .then(true)
                            .otherwise(false),
                        bgmAgitCommonComment.parentId.stringValue()
                ))
                .from(bgmAgitCommonComment)
                .where(bgmAgitCommonComment.targetId.eq(id))
                .orderBy(
                    bgmAgitCommonComment.depth.asc(),
                    bgmAgitCommonComment.id.asc()
                )
                .fetch();
    }
}
