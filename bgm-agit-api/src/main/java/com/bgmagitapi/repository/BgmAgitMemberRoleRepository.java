package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitMemberRole;
import com.bgmagitapi.repository.costom.BgmAgitMemberRoleCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitMemberRoleRepository extends JpaRepository<BgmAgitMemberRole, Long>, BgmAgitMemberRoleCustomRepository {
    
}
