package com.bgmagitapi.kml.menu.repository.impl;

import com.bgmagitapi.kml.menu.entity.KmlMenu;
import com.bgmagitapi.kml.menu.repository.query.KmlMenuQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.kml.menu.entity.QKmlMenu.kmlMenu;

@RequiredArgsConstructor
public class KmlMenuRepositoryImpl implements KmlMenuQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<KmlMenu> findAllMenuOrders() {
        return queryFactory.selectFrom(kmlMenu)
                .orderBy(kmlMenu.orders.asc())
                .fetch();
    }
}
