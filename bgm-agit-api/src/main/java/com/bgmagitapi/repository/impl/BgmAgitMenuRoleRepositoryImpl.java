package com.bgmagitapi.repository.impl;

import com.bgmagitapi.repository.custom.BgmAgitMenuRoleCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitMenuRole.bgmAgitMenuRole;
import static com.bgmagitapi.entity.QBgmAgitRole.bgmAgitRole;

@RequiredArgsConstructor
public class BgmAgitMenuRoleRepositoryImpl implements BgmAgitMenuRoleCustomRepository {
    
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<Long> findMenuIdByRoleNames(List<String> roles) {
        return queryFactory
                .select(bgmAgitMenuRole.bgmAgitMainMenu.bgmAgitMainMenuId)
                .from(bgmAgitMenuRole)
                .join(bgmAgitMenuRole.bgmAgitRole , bgmAgitRole)
                .where(bgmAgitRole.bgmAgitRoleName.in(roles))
                .fetch();
    }
}
