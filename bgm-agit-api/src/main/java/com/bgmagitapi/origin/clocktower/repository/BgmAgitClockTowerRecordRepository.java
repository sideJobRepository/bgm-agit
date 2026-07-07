package com.bgmagitapi.origin.clocktower.repository;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerRecord;
import com.bgmagitapi.origin.clocktower.repository.query.ClockTowerStatsQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitClockTowerRecordRepository
        extends JpaRepository<BgmAgitClockTowerRecord, Long>, ClockTowerStatsQueryRepository {

    boolean existsByGame_Id(Long gameId);
}
