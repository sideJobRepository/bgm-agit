package com.bgmagitapi.origin.clocktower.repository.impl;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerJinx;
import com.bgmagitapi.origin.clocktower.repository.custom.BgmAgitClockTowerJinxCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.Collection;
import java.util.List;

import static com.bgmagitapi.origin.clocktower.entity.QBgmAgitClockTowerJinx.bgmAgitClockTowerJinx;

@RequiredArgsConstructor
public class BgmAgitClockTowerJinxRepositoryImpl implements BgmAgitClockTowerJinxCustomRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<BgmAgitClockTowerJinx> findAmong(Collection<String> roleKeys) {
        if (roleKeys == null || roleKeys.isEmpty()) return List.of();
        return queryFactory
                .selectFrom(bgmAgitClockTowerJinx)
                .where(bgmAgitClockTowerJinx.roleA.in(roleKeys), bgmAgitClockTowerJinx.roleB.in(roleKeys))
                .orderBy(bgmAgitClockTowerJinx.roleA.asc(), bgmAgitClockTowerJinx.roleB.asc())
                .fetch();
    }
}
