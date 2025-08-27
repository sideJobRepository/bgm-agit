package com.bgmagitapi.repository.impl;

import com.bgmagitapi.entity.BgmAgitNotice;
import com.bgmagitapi.repository.costom.BgmAgitNoticeCostomRepository;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitNotice.bgmAgitNotice;


@RequiredArgsConstructor
public class BgmAgitNoticeRepositoryImpl implements BgmAgitNoticeCostomRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public Page<BgmAgitNotice> getNotices(Pageable pageable, String titleOrCont) {

        List<BgmAgitNotice> content = queryFactory
                .selectFrom(bgmAgitNotice)
                .where(titleOrContLikeIgnoreSpaces(titleOrCont))
                .orderBy(bgmAgitNotice.bgmAgitNoticeId.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();
        

        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitNotice.count())
                .from(bgmAgitNotice)
                .where(titleOrContLikeIgnoreSpaces(titleOrCont));
        return PageableExecutionUtils.getPage(content,pageable,countQuery::fetchOne);
    }
 
    /** 제목/내용에서 공백 제거 후 LIKE %keyword% 검색(OR) */
    private BooleanExpression titleOrContLikeIgnoreSpaces(String keyword) {
        if (!StringUtils.hasText(keyword)) return null;
        
        String k = keyword.replaceAll("\\s+", "");
        StringExpression titleNoSpace = Expressions.stringTemplate(
                "replace({0}, ' ', '')", bgmAgitNotice.bgmAgitNoticeTitle);
        StringExpression contNoSpace = Expressions.stringTemplate(
                "replace({0}, ' ', '')", bgmAgitNotice.bgmAgitNoticeCont);
        
        return titleNoSpace.like("%" + k + "%")
                .or(contNoSpace.like("%" + k + "%"));
    }
}
