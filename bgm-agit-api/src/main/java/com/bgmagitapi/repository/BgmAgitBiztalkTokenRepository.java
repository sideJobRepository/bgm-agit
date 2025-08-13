package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitBiztalkToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface BgmAgitBiztalkTokenRepository extends JpaRepository<BgmAgitBiztalkToken, Long>  {
    
    @Transactional
    @Query("DELETE FROM BgmAgitBiztalkToken B WHERE B.bgmAgitBiztalkIp = :bgmAgitBiztalkIp")
    @Modifying(clearAutomatically = true)
    int deleteIp(String bgmAgitBiztalkIp);
}
