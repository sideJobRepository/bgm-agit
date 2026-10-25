package com.bgmagitapi.origin.clocktower.repository.impl;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerGame;
import com.bgmagitapi.origin.clocktower.repository.custom.BgmAgitClockTowerGameCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import static com.bgmagitapi.origin.clocktower.entity.QBgmAgitClockTowerGame.bgmAgitClockTowerGame;

@RequiredArgsConstructor
public class BgmAgitClockTowerGameRepositoryImpl implements BgmAgitClockTowerGameCustomRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<BgmAgitClockTowerGame> findByScriptKey(String scriptKey) {
        return Optional.ofNullable(queryFactory
                .selectFrom(bgmAgitClockTowerGame)
                .where(bgmAgitClockTowerGame.scriptKey.eq(scriptKey))
                .orderBy(bgmAgitClockTowerGame.id.asc())
                .fetchFirst());
    }
}
