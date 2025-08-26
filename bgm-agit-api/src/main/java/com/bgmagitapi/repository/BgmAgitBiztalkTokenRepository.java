package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitBiztalkToken;
import com.bgmagitapi.repository.costom.BgmAgitBiztalkTokenCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface BgmAgitBiztalkTokenRepository extends JpaRepository<BgmAgitBiztalkToken, Long> , BgmAgitBiztalkTokenCustomRepository {
    

}
