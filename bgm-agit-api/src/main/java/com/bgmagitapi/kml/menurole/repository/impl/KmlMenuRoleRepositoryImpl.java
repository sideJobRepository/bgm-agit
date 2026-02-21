package com.bgmagitapi.kml.menurole.repository.impl;

import com.bgmagitapi.kml.menurole.repository.query.KmlMenuRoleQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitRole.bgmAgitRole;
import static com.bgmagitapi.kml.menurole.entity.QKmlMenuRole.kmlMenuRole;

@RequiredArgsConstructor
public class KmlMenuRoleRepositoryImpl implements KmlMenuRoleQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<Long> findMenuIdByRoleNames(List<String> roles) {
        return queryFactory
                .select(kmlMenuRole.menu.id)
                .from(kmlMenuRole)
                .join(kmlMenuRole.role, bgmAgitRole)
                .where(bgmAgitRole.bgmAgitRoleName.in(roles))
                .fetch();
    }
}
