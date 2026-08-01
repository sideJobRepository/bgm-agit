package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitRefreshToken;

import java.time.LocalDateTime;
import java.util.Optional;

public interface BgmAgitRefreshTokenCustomRepository {

    Optional<BgmAgitRefreshToken> findByMemberAndPlatformId(BgmAgitMember member, String platformId);

    Optional<BgmAgitRefreshToken> findByTokenValueAndPlatformId(String refreshTokenValue, String platformId);

    long deleteByModifyDateBefore(LocalDateTime targetTime);
}
