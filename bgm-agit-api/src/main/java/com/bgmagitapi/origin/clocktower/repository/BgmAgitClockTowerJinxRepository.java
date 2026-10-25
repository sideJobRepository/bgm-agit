package com.bgmagitapi.origin.clocktower.repository;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerJinx;
import com.bgmagitapi.origin.clocktower.repository.custom.BgmAgitClockTowerJinxCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitClockTowerJinxRepository
        extends JpaRepository<BgmAgitClockTowerJinx, Long>, BgmAgitClockTowerJinxCustomRepository {
}
