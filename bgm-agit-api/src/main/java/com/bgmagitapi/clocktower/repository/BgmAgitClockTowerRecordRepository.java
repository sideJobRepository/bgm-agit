package com.bgmagitapi.clocktower.repository;

import com.bgmagitapi.clocktower.entity.BgmAgitClockTowerRecord;
import com.bgmagitapi.clocktower.repository.query.ClockTowerStatsQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitClockTowerRecordRepository
        extends JpaRepository<BgmAgitClockTowerRecord, Long>, ClockTowerStatsQueryRepository {

    boolean existsByGame_Id(Long gameId);
}
