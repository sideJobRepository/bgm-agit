package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitUrlResourcesRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitUrlResourcesRoleRepository extends JpaRepository<BgmAgitUrlResourcesRole, Long> {

    boolean existsByBgmAgitRole_BgmAgitRoleIdAndBgmAgitUrlResources_BgmAgitUrlResourcesId(Long roleId, Long resourcesId);
}
