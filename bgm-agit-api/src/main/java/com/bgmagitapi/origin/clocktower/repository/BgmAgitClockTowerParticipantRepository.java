package com.bgmagitapi.origin.clocktower.repository;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitClockTowerParticipantRepository extends JpaRepository<BgmAgitClockTowerParticipant, Long> {

    void deleteByRecord_Id(Long recordId);
}
