package com.bgmagitapi.kml.notice.repository.impl;

import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.QBgmAgitCommonFile;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.menu.dto.response.KmlMenuGetResponse;
import com.bgmagitapi.kml.notice.dto.response.KmlNoticeGetResponse;
import com.bgmagitapi.kml.notice.dto.response.QKmlNoticeGetResponse;
import com.bgmagitapi.kml.notice.entity.QKmlNotice;
import com.bgmagitapi.kml.notice.repository.query.KmlNoticeQueryRepository;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitCommonFile.*;
import static com.bgmagitapi.kml.notice.entity.QKmlNotice.*;

@RequiredArgsConstructor
public class KmlNoticeRepositoryImpl implements KmlNoticeQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public Page<KmlNoticeGetResponse> findByKmlNotice(Pageable pageable) {
        List<KmlNoticeGetResponse> result = queryFactory
                .select(
                        new QKmlNoticeGetResponse(
                                kmlNotice.id,
                                kmlNotice.noticeTitle,
                                kmlNotice.noticeCont
                        )
                )
                .from(kmlNotice)
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .fetch();
        
        JPAQuery<Long> countQuery = queryFactory
                .select(kmlNotice.count())
                .from(kmlNotice);
        return PageableExecutionUtils.getPage(result, pageable, countQuery::fetchOne);
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
