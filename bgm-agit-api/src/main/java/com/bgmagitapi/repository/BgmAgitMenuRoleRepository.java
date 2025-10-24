package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitMenuRole;
import com.bgmagitapi.repository.custom.BgmAgitMenuRoleCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitMenuRoleRepository extends JpaRepository<BgmAgitMenuRole, Long>, BgmAgitMenuRoleCustomRepository {

}
