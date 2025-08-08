package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BgmAgitRefreshTokenRepository extends JpaRepository<BgmAgitRefreshToken, Long> {
    Optional<BgmAgitRefreshToken> findByBgmAgitMember(BgmAgitMember member);
    
    Optional<BgmAgitRefreshToken> findByBgmAgitRefreshTokenValue(String refreshTokenValue);
    
    
    
}
