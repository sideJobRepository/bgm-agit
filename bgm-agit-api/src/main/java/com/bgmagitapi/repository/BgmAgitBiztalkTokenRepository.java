package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitBiztalkToken;
import com.bgmagitapi.repository.custom.BgmAgitBiztalkTokenCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitBiztalkTokenRepository extends JpaRepository<BgmAgitBiztalkToken, Long> , BgmAgitBiztalkTokenCustomRepository {
    

}
