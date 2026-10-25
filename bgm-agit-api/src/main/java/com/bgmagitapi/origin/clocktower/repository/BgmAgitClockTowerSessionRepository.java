package com.bgmagitapi.origin.clocktower.repository;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerSession;
import com.bgmagitapi.origin.clocktower.repository.custom.BgmAgitClockTowerSessionCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitClockTowerSessionRepository
        extends JpaRepository<BgmAgitClockTowerSession, Long>, BgmAgitClockTowerSessionCustomRepository {
}
