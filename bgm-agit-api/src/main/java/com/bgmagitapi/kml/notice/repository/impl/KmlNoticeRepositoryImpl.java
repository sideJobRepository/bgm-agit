package com.bgmagitapi.kml.notice.repository.impl;

import com.bgmagitapi.kml.menu.dto.response.KmlMenuGetResponse;
import com.bgmagitapi.kml.notice.entity.QKmlNotice;
import com.bgmagitapi.kml.notice.repository.query.KmlNoticeQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import static com.bgmagitapi.kml.notice.entity.QKmlNotice.*;

@RequiredArgsConstructor
public class KmlNoticeRepositoryImpl implements KmlNoticeQueryRepository {

    private final JPAQueryFactory queryFactory;
    
    @Override
    public Page<KmlMenuGetResponse> findByKmlNotce(Pageable pageable) {
        
        QKmlNotice qKmlNotice = kmlNotice;
        
        queryFactory
                .select(kmlNotice)
                .from(kmlNotice)
                .fetch();
        return null;
    }
}
