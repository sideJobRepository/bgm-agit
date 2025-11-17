package com.bgmagitapi.repository.impl;

import com.bgmagitapi.entity.BgmAgitInquiry;
import com.bgmagitapi.repository.custom.BgmAgitInquiryCustomRepository;
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

import static com.bgmagitapi.entity.QBgmAgitInquiry.bgmAgitInquiry;
import static com.bgmagitapi.entity.QBgmAgitMember.bgmAgitMember;

@RequiredArgsConstructor
public class BgmAgitInquiryRepositoryImpl implements BgmAgitInquiryCustomRepository {
    
    private final JPAQueryFactory queryFactory;
    
    private final EntityManager em;
    
    @Override
    public Page<BgmAgitInquiry> findByInquirys(Long memberId, boolean isUser, Pageable pageable, String titleOrCont) {
        
        List<BgmAgitInquiry> result = queryFactory
                .select(bgmAgitInquiry)
                .from(bgmAgitInquiry)
                .join(bgmAgitInquiry.bgmAgitMember, bgmAgitMember).fetchJoin()
                .where(isUserFilter(memberId, isUser) , bgmAgitInquiry.bgmAgitInquiryHierarchyId.isNull(),titleOrContLikeIgnoreSpaces(titleOrCont))
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();
        
        
        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitInquiry.count())
                .from(bgmAgitInquiry)
                .join(bgmAgitInquiry.bgmAgitMember, bgmAgitMember).fetchJoin()
                .where(isUserFilter(memberId, isUser),bgmAgitInquiry.bgmAgitInquiryHierarchyId.isNull());
        
        return PageableExecutionUtils.getPage(result, pageable, countQuery::fetchOne);
    }
    
    @Override
    public List<BgmAgitInquiry> findByDetailInquiry(Long inquiryId) {
      return queryFactory
                .selectFrom(bgmAgitInquiry)
                .join(bgmAgitInquiry.bgmAgitMember, bgmAgitMember).fetchJoin()
                .where(
                        bgmAgitInquiry.bgmAgitInquiryId.eq(inquiryId)
                                .or(bgmAgitInquiry.bgmAgitInquiryHierarchyId.eq(inquiryId))
                )
                .orderBy(bgmAgitInquiry.bgmAgitInquiryHierarchyId.asc().nullsFirst(),
                        bgmAgitInquiry.bgmAgitInquiryId.asc())
                .fetch();
    }
    
    @Override
    public Long deleteByInquiry(Long id) {
        em.flush();
        long deletedReplies = queryFactory
            .delete(bgmAgitInquiry)
            .where(bgmAgitInquiry.bgmAgitInquiryHierarchyId.eq(id))
            .execute();
    
        long deletedParent = queryFactory
            .delete(bgmAgitInquiry)
            .where(bgmAgitInquiry.bgmAgitInquiryId.eq(id))
            .execute();
        
        em.clear();
        return deletedReplies + deletedParent;
    }
    
    private BooleanExpression isUserFilter(Long memberId, boolean isUser) {
        return isUser ? bgmAgitInquiry.bgmAgitMember.bgmAgitMemberId.eq(memberId) : null;
    }
    
    /** 제목/내용에서 공백 제거 후 LIKE %keyword% 검색(OR) */
    private BooleanExpression titleOrContLikeIgnoreSpaces(String keyword) {
        if (!StringUtils.hasText(keyword)) return null;
        
        String k = keyword.replaceAll("\\s+", "");
        StringExpression titleNoSpace = Expressions.stringTemplate(
                "replace({0}, ' ', '')", bgmAgitInquiry.bgmAgitInquiryTitle);
        StringExpression contNoSpace = Expressions.stringTemplate(
                "replace({0}, ' ', '')", bgmAgitInquiry.bgmAgitInquiryCont);
        
        return titleNoSpace.like("%" + k + "%")
                .or(contNoSpace.like("%" + k + "%"));
    }
    
}
