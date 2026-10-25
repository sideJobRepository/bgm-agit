package com.bgmagitapi.origin.clocktower.repository.impl;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerRole;
import com.bgmagitapi.origin.clocktower.repository.custom.BgmAgitClockTowerRoleCustomRepository;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.List;

import static com.bgmagitapi.origin.clocktower.entity.QBgmAgitClockTowerCharacter.bgmAgitClockTowerCharacter;
import static com.bgmagitapi.origin.clocktower.entity.QBgmAgitClockTowerRole.bgmAgitClockTowerRole;

@RequiredArgsConstructor
public class BgmAgitClockTowerRoleRepositoryImpl implements BgmAgitClockTowerRoleCustomRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<BgmAgitClockTowerRole> findOfficialRoles() {
        return queryFactory
                .selectFrom(bgmAgitClockTowerRole)
                .where(bgmAgitClockTowerRole.gameId.isNull())
                .fetch();
    }

    @Override
    public List<BgmAgitClockTowerRole> searchOfficialRoles(ClockTowerCharacterType team, String keyword) {
        return queryFactory
                .selectFrom(bgmAgitClockTowerRole)
                .where(bgmAgitClockTowerRole.gameId.isNull(),
                        bgmAgitClockTowerRole.team.isNotNull(),
                        teamEq(team),
                        nameContains(keyword))
                .orderBy(bgmAgitClockTowerRole.team.asc(), bgmAgitClockTowerRole.name.asc())
                .fetch();
    }

    @Override
    public List<BgmAgitClockTowerRole> findByRoleKeys(Collection<String> roleKeys) {
        if (roleKeys == null || roleKeys.isEmpty()) return List.of();
        return queryFactory
                .selectFrom(bgmAgitClockTowerRole)
                .where(bgmAgitClockTowerRole.roleKey.in(roleKeys))
                .fetch();
    }

    @Override
    public long syncCharacters(String roleKey, String name, ClockTowerCharacterType type, String ability) {
        return queryFactory
                .update(bgmAgitClockTowerCharacter)
                .set(bgmAgitClockTowerCharacter.name, name)
                .set(bgmAgitClockTowerCharacter.characterType, type)
                .set(bgmAgitClockTowerCharacter.description, ability)
                .where(bgmAgitClockTowerCharacter.roleKey.eq(roleKey))
                .execute();
    }

    @Override
    public long deleteByGameId(Long gameId) {
        return queryFactory
                .delete(bgmAgitClockTowerRole)
                .where(bgmAgitClockTowerRole.gameId.eq(gameId))
                .execute();
    }

    private BooleanExpression teamEq(ClockTowerCharacterType team) {
        return team == null ? null : bgmAgitClockTowerRole.team.eq(team);
    }

    private BooleanExpression nameContains(String keyword) {
        if (!StringUtils.hasText(keyword)) return null;
        String kw = keyword.trim();
        return bgmAgitClockTowerRole.name.contains(kw).or(bgmAgitClockTowerRole.nameEn.containsIgnoreCase(kw));
    }
}
