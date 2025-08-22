package com.bgmagitapi.repository.impl;

import com.bgmagitapi.entity.BgmAgitNotice;
import com.bgmagitapi.repository.costom.BgmAgitNoticeCostomRepository;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.dsl.Expressions;
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
        BooleanBuilder booleanBuilder = getBooleanBuilder(titleOrCont);

        List<BgmAgitNotice> content = queryFactory
                .selectFrom(bgmAgitNotice)
                .where(booleanBuilder)
                .orderBy(bgmAgitNotice.bgmAgitNoticeId.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();
        

        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitNotice.count())
                .from(bgmAgitNotice)
                .where(booleanBuilder);
        return PageableExecutionUtils.getPage(content,pageable,countQuery::fetchOne);
    }
    
    private BooleanBuilder getBooleanBuilder(String titleOrCont) {
        BooleanBuilder booleanBuilder = new BooleanBuilder();
        
        
        if (StringUtils.hasText(titleOrCont)) {
            String keyword = titleOrCont.replaceAll("\\s+", ""); // 검색어에서 공백 제거
            
            booleanBuilder.or(
                    Expressions.stringTemplate("REPLACE({0}, ' ', '')", bgmAgitNotice.bgmAgitNoticeTitle)
                            .like("%" + keyword + "%")
            ).or(
                    Expressions.stringTemplate("REPLACE({0}, ' ', '')", bgmAgitNotice.bgmAgitNoticeCont)
                            .like("%" + keyword + "%")
            );
        }
        return booleanBuilder;
    }
}
