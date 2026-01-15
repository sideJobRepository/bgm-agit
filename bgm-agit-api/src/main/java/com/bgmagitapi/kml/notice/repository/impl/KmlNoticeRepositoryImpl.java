package com.bgmagitapi.kml.notice.repository.impl;

import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.notice.dto.response.KmlNoticeGetResponse;
import com.bgmagitapi.kml.notice.dto.response.QKmlNoticeGetResponse;
import com.bgmagitapi.kml.notice.repository.query.KmlNoticeQueryRepository;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitCommonFile.*;
import static com.bgmagitapi.kml.notice.entity.QKmlNotice.*;

@RequiredArgsConstructor
public class KmlNoticeRepositoryImpl implements KmlNoticeQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public Page<KmlNoticeGetResponse> findByKmlNotice(Pageable pageable, String titleAndCont) {
        List<KmlNoticeGetResponse> result = queryFactory
                .select(
                        new QKmlNoticeGetResponse(
                                kmlNotice.id,
                                kmlNotice.noticeTitle,
                                kmlNotice.noticeCont
                        )
                )
                .from(kmlNotice)
                .where(whereTitleAndCont(titleAndCont))
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .orderBy(kmlNotice.registDate.desc())
                .fetch();
        
        JPAQuery<Long> countQuery = queryFactory
                .select(kmlNotice.count())
                .from(kmlNotice)
                .where(whereTitleAndCont(titleAndCont));
        return PageableExecutionUtils.getPage(result, pageable, countQuery::fetchOne);
    }
    
    private BooleanExpression whereTitleAndCont(String titleAndCont) {
        if (!StringUtils.hasText(titleAndCont)) {
            return null;
        }
        String value = "%" + titleAndCont.trim() + "%";
    
        return kmlNotice.noticeTitle.like(value)
                .or(kmlNotice.noticeCont.like(value));
    }
    
    @Override
    public List<BgmAgitCommonFile> findByKmlNoticeFiles(List<Long> noticeIds) {
        return queryFactory
                .selectFrom(bgmAgitCommonFile)
                .where(bgmAgitCommonFile.bgmAgitCommonFileTargetId.in(noticeIds),
                        bgmAgitCommonFile.bgmAgitCommonFileType.eq(BgmAgitCommonType.KML_NOTICE)
                )
                .fetch();
    }
    
    
}
