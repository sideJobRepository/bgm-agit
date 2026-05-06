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
    public Optional<BgmAgitRefreshToken> findByMemberAndPlatformId(BgmAgitMember member, String platformId) {
        BgmAgitRefreshToken token = queryFactory
                .selectFrom(bgmAgitRefreshToken)
                .where(
                        bgmAgitRefreshToken.bgmAgitMember.eq(member),
                        bgmAgitRefreshToken.bgmAgitRefreshPlatformId.eq(platformId)
                )
                .fetchOne();
        return Optional.ofNullable(token);
    }

    @Override
    public Optional<BgmAgitRefreshToken> findByTokenValueAndPlatformId(String refreshTokenValue, String platformId) {
        BgmAgitRefreshToken token = queryFactory
                .selectFrom(bgmAgitRefreshToken)
                .where(
                        bgmAgitRefreshToken.bgmAgitRefreshTokenValue.eq(refreshTokenValue),
                        bgmAgitRefreshToken.bgmAgitRefreshPlatformId.eq(platformId)
                )
                .fetchOne();
        return Optional.ofNullable(token);
    }
}
