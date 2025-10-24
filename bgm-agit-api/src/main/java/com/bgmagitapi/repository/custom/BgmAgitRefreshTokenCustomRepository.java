package com.bgmagitapi.repository.custom;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitRefreshToken;

import java.util.Optional;

public interface BgmAgitRefreshTokenCustomRepository {
    
    Optional<BgmAgitRefreshToken> findBgmAgitMember(BgmAgitMember member);
    
    Optional<BgmAgitRefreshToken> findBgmAgitRefreshTokenValue(String refreshTokenValue);
}
