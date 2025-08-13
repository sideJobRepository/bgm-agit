package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitBiztalkToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitBiztalkTokenRepository extends JpaRepository<BgmAgitBiztalkToken, Long>  {
    
    void deleteByBgmAgitBiztalkIp(String bgmAgitBiztalkIp);
}
