package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitBiztalkToken;
import com.bgmagitapi.origin.repository.custom.BgmAgitBiztalkTokenCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitBiztalkTokenRepository extends JpaRepository<BgmAgitBiztalkToken, Long> , BgmAgitBiztalkTokenCustomRepository {
    

}
