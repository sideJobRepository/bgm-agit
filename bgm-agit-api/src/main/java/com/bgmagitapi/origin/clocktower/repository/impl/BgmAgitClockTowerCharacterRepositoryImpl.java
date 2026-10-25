package com.bgmagitapi.origin.clocktower.repository.impl;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerCharacter;
import com.bgmagitapi.origin.clocktower.repository.custom.BgmAgitClockTowerCharacterCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import static com.bgmagitapi.origin.clocktower.entity.QBgmAgitClockTowerCharacter.bgmAgitClockTowerCharacter;

@RequiredArgsConstructor
public class BgmAgitClockTowerCharacterRepositoryImpl implements BgmAgitClockTowerCharacterCustomRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<BgmAgitClockTowerCharacter> findInGameByRoleKey(Long gameId, String roleKey) {
        return Optional.ofNullable(queryFactory
                .selectFrom(bgmAgitClockTowerCharacter)
                .where(bgmAgitClockTowerCharacter.game.id.eq(gameId),
                        bgmAgitClockTowerCharacter.roleKey.eq(roleKey))
                .orderBy(bgmAgitClockTowerCharacter.orders.asc())
                .fetchFirst());
    }
}
