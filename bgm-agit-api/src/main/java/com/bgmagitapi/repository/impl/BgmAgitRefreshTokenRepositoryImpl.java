package com.bgmagitapi.repository.impl;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitRefreshToken;
import com.bgmagitapi.repository.custom.BgmAgitRefreshTokenCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import static com.bgmagitapi.entity.QBgmAgitRefreshToken.bgmAgitRefreshToken;

@RequiredArgsConstructor
public class BgmAgitRefreshTokenRepositoryImpl  implements BgmAgitRefreshTokenCustomRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public Optional<BgmAgitRefreshToken> findBgmAgitMember(BgmAgitMember member) {
        BgmAgitRefreshToken token = queryFactory
                .selectFrom(bgmAgitRefreshToken)
                .where(bgmAgitRefreshToken.bgmAgitMember.eq(member))
                .fetchOne();
        return Optional.ofNullable(token);
    }
    
    @Override
    public Optional<BgmAgitRefreshToken> findBgmAgitRefreshTokenValue(String refreshTokenValue) {
        BgmAgitRefreshToken tone = queryFactory
                .selectFrom(bgmAgitRefreshToken)
                .where(bgmAgitRefreshToken.bgmAgitRefreshTokenValue.eq(refreshTokenValue))
                .fetchOne();
        return Optional.ofNullable(tone);
    }
}
