package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitRoleRepository extends JpaRepository<BgmAgitRole, Long> {
    
    
    BgmAgitRole findByBgmAgitRoleName(String bgmAgitRoleName);
}
