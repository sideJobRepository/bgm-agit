package com.bgmagitapi.clocktower.repository;

import com.bgmagitapi.clocktower.entity.BgmAgitClockTowerParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitClockTowerParticipantRepository extends JpaRepository<BgmAgitClockTowerParticipant, Long> {

    void deleteByRecord_Id(Long recordId);
}
