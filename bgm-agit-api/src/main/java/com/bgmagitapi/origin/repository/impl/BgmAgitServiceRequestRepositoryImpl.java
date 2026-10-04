package com.bgmagitapi.origin.repository.impl;

import com.bgmagitapi.origin.entity.BgmAgitServiceRequest;
import com.bgmagitapi.origin.repository.custom.BgmAgitServiceRequestCustomRepository;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.bgmagitapi.origin.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.origin.entity.QBgmAgitServiceRequest.bgmAgitServiceRequest;

@RequiredArgsConstructor
public class BgmAgitServiceRequestRepositoryImpl implements BgmAgitServiceRequestCustomRepository {

    private final JPAQueryFactory queryFactory;

    private final EntityManager em;

    @Override
    public Page<BgmAgitServiceRequest> findServiceRequests(Pageable pageable, String titleOrCont) {
        List<BgmAgitServiceRequest> result = queryFactory
                .selectFrom(bgmAgitServiceRequest)
                .join(bgmAgitServiceRequest.bgmAgitMember, bgmAgitMember).fetchJoin()
                .where(bgmAgitServiceRequest.bgmAgitServiceRequestHierarchyId.isNull(),
                       titleOrContLikeIgnoreSpaces(titleOrCont))
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(bgmAgitServiceRequest.registDate.desc())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitServiceRequest.count())
                .from(bgmAgitServiceRequest)
                .where(bgmAgitServiceRequest.bgmAgitServiceRequestHierarchyId.isNull(),
                       titleOrContLikeIgnoreSpaces(titleOrCont));

        return PageableExecutionUtils.getPage(result, pageable, countQuery::fetchOne);
    }

    @Override
    public List<BgmAgitServiceRequest> findByDetailServiceRequest(Long id) {
        return queryFactory
                .selectFrom(bgmAgitServiceRequest)
                .join(bgmAgitServiceRequest.bgmAgitMember, bgmAgitMember).fetchJoin()
                .where(bgmAgitServiceRequest.bgmAgitServiceRequestId.eq(id)
                        .or(bgmAgitServiceRequest.bgmAgitServiceRequestHierarchyId.eq(id)))
                .orderBy(bgmAgitServiceRequest.bgmAgitServiceRequestHierarchyId.asc().nullsFirst(),
                         bgmAgitServiceRequest.bgmAgitServiceRequestId.asc())
                .fetch();
    }

    @Override
    public Long deleteByServiceRequest(Long id) {
        em.flush();
        long deletedReplies = queryFactory
                .delete(bgmAgitServiceRequest)
                .where(bgmAgitServiceRequest.bgmAgitServiceRequestHierarchyId.eq(id))
                .execute();

        long deletedParent = queryFactory
                .delete(bgmAgitServiceRequest)
                .where(bgmAgitServiceRequest.bgmAgitServiceRequestId.eq(id))
                .execute();

        em.clear();
        return deletedReplies + deletedParent;
    }

    /** 제목/내용에서 공백 제거 후 LIKE %keyword% 검색(OR) */
    private BooleanExpression titleOrContLikeIgnoreSpaces(String keyword) {
        if (!StringUtils.hasText(keyword)) return null;

        String k = keyword.replaceAll("\s+", "");
        StringExpression titleNoSpace = Expressions.stringTemplate(
                "replace({0}, ' ', '')", bgmAgitServiceRequest.bgmAgitServiceRequestTitle);
        StringExpression contNoSpace = Expressions.stringTemplate(
                "replace({0}, ' ', '')", bgmAgitServiceRequest.bgmAgitServiceRequestCont);

        return titleNoSpace.like("%" + k + "%")
                .or(contNoSpace.like("%" + k + "%"));
    }
}
