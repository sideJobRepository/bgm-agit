package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitRefreshToken;
import com.bgmagitapi.repository.custom.BgmAgitRefreshTokenCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitRefreshTokenRepository extends JpaRepository<BgmAgitRefreshToken, Long> , BgmAgitRefreshTokenCustomRepository {

    // 회원 삭제 시 해당 회원의 리프레시 토큰 행 제거 (FK RESTRICT 회피)
    void deleteByBgmAgitMember_BgmAgitMemberId(Long memberId);
}
