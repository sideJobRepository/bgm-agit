package com.bgmagitapi.origin.clocktower.repository;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerRole;
import com.bgmagitapi.origin.clocktower.repository.custom.BgmAgitClockTowerRoleCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitClockTowerRoleRepository
        extends JpaRepository<BgmAgitClockTowerRole, Long>, BgmAgitClockTowerRoleCustomRepository {
}
