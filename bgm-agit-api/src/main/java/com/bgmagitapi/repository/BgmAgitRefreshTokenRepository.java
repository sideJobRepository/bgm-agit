package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitRefreshToken;
import com.bgmagitapi.repository.costom.BgmAgitRefreshTokenCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitRefreshTokenRepository extends JpaRepository<BgmAgitRefreshToken, Long> , BgmAgitRefreshTokenCustomRepository {

}
