package com.bgmagitapi.kml.review.repository.impl;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.review.dto.response.QReviewGetDetailResponse;
import com.bgmagitapi.kml.review.dto.response.QReviewGetResponse;
import com.bgmagitapi.kml.review.dto.response.ReviewGetDetailResponse;
import com.bgmagitapi.kml.review.dto.response.ReviewGetResponse;
import com.bgmagitapi.kml.review.entity.Review;
import com.bgmagitapi.kml.review.repository.query.ReviewQueryRepository;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FilenameUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitCommonComment.bgmAgitCommonComment;
import static com.bgmagitapi.entity.QBgmAgitCommonFile.bgmAgitCommonFile;
import static com.bgmagitapi.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.kml.review.entity.QReview.review;

@RequiredArgsConstructor
public class ReviewRepositoryImpl implements ReviewQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    private final EntityManager em;
    
    @Override
    public Page<ReviewGetResponse> findAllByReviews(Pageable pageable, String titleOrCont) {
        List<ReviewGetResponse> result = queryFactory
                .select(new QReviewGetResponse(
                        review.id,
                        review.title,
                        review.cont,
                        review.member.bgmAgitMemberId,
                        review.member.bgmAgitMemberName,
                        review.member.bgmAgitMemberNickname,
                        review.registDate,
                        bgmAgitCommonComment.count()
                ))
                .from(review)
                .leftJoin(bgmAgitCommonComment)
                .on(bgmAgitCommonComment.targetId.eq(review.id)
                        .and(bgmAgitCommonComment.bgmAgitCommonType.eq(BgmAgitCommonType.REVIEW)))
                .where(titleOrContLikeIgnoreSpaces(titleOrCont))
                .groupBy(review.id,
                        review.member.bgmAgitMemberId,
                        review.member.bgmAgitMemberName,
                        review.registDate)
                .orderBy(review.id.desc())
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .fetch();
        
        JPAQuery<Long> countQuery = queryFactory
                .select(review.count())
                .where(titleOrContLikeIgnoreSpaces(titleOrCont))
                .from(review);
        
        return PageableExecutionUtils.getPage(result, pageable, countQuery::fetchOne);
    }
    
    @Override
    public ReviewGetDetailResponse findByReviewDetail(Long reviewId) {
        return queryFactory
                .select(new QReviewGetDetailResponse(
                        review.id,
                        bgmAgitMember.bgmAgitMemberId,
                        review.title,
                        review.cont,
                        review.registDate,
                        bgmAgitMember.bgmAgitMemberName,
                        bgmAgitMember.bgmAgitMemberNickname
                ))
                .from(review)
                .join(review.member, bgmAgitMember)
                .where(review.id.eq(reviewId))
                .fetchFirst();
    }
    
    @Override
    public Review findByIdAndMemberId(Long id, BgmAgitMember member) {
        return queryFactory
                .selectFrom(review)
                .where(review.id.eq(id)
                        , review.member.eq(member)
                ).fetchFirst();
    }
    
    @Override
    public List<ReviewGetDetailResponse.ReviewGetDetailResponseFile> findFiles(Long reviewId) {
        List<ReviewGetDetailResponse.ReviewGetDetailResponseFile> result = queryFactory.select(Projections.constructor(
                        ReviewGetDetailResponse.ReviewGetDetailResponseFile.class,
                        bgmAgitCommonFile.bgmAgitCommonFileId,
                        bgmAgitCommonFile.bgmAgitCommonFileName,
                        bgmAgitCommonFile.bgmAgitCommonFileUuidName,
                        bgmAgitCommonFile.bgmAgitCommonFileUrl
                ))
                .from(bgmAgitCommonFile)
                .where(bgmAgitCommonFile.bgmAgitCommonFileTargetId.eq(reviewId),bgmAgitCommonFile.bgmAgitCommonFileType.eq(BgmAgitCommonType.REVIEW))
                .fetch();
        result
                .forEach(item -> {
                    String extension = FilenameUtils.getExtension(item.getFileName());
                    item.setUuidName(item.getUuidName() + "." + extension);
                });
        return result;
    }
    
    @Override
    public List<ReviewGetDetailResponse.ReviewGetDetailResponseComment> findComments(Long reviewId, Long memberId) {
        return queryFactory.select(Projections.constructor(
                        ReviewGetDetailResponse.ReviewGetDetailResponseComment.class,
                        bgmAgitCommonComment.id.stringValue(),
                        bgmAgitCommonComment.member.bgmAgitMemberName,
                        bgmAgitCommonComment.member.bgmAgitMemberNickname,
                        bgmAgitCommonComment.content,
                        bgmAgitCommonComment.depth,
                        Expressions.cases()
                                .when(memberId != null
                                        ? bgmAgitCommonComment.member.bgmAgitMemberId.eq(memberId)
                                        : Expressions.FALSE)
                                .then(true)
                                .otherwise(false),
                        bgmAgitCommonComment.parentId.stringValue(),
                        bgmAgitCommonComment.registDate,
                        bgmAgitCommonComment.delStatus
                ))
                .from(bgmAgitCommonComment)
                .where(bgmAgitCommonComment.targetId.eq(reviewId) , bgmAgitCommonComment.bgmAgitCommonType.eq(BgmAgitCommonType.REVIEW))
                .orderBy(
                        bgmAgitCommonComment.depth.asc(),
                        bgmAgitCommonComment.id.asc()
                )
                .fetch();
    }
    
    @Override
    public Long deleteByIdAndMember(Long id, BgmAgitMember bgmAgitMember) {
        em.flush();
        long execute = queryFactory
                .delete(review)
                .where(review.id.eq(id),
                        review.member.eq(bgmAgitMember)
                ).execute();
        em.clear();
        return execute;
    }
    
    
    private BooleanExpression titleOrContLikeIgnoreSpaces(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return null;
        }
        String k = keyword.replaceAll("\\s+", "");
        StringExpression titleNoSpace = Expressions.stringTemplate(
                "replace({0}, ' ', '')", review.title);
        StringExpression contNoSpace = Expressions.stringTemplate(
                "replace({0}, ' ', '')", review.cont);
        
        return titleNoSpace.like("%" + k + "%")
                .or(contNoSpace.like("%" + k + "%"));
    }
}
