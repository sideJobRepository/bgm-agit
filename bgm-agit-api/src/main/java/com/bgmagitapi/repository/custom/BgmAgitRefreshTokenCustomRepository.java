package com.bgmagitapi.repository.custom;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitRefreshToken;

import java.util.Optional;

public interface BgmAgitRefreshTokenCustomRepository {

    Optional<BgmAgitRefreshToken> findByMemberAndPlatformId(BgmAgitMember member, String platformId);

    Optional<BgmAgitRefreshToken> findByTokenValueAndPlatformId(String refreshTokenValue, String platformId);
}
