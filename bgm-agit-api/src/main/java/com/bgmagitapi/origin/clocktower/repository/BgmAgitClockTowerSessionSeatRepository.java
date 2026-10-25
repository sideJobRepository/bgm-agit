package com.bgmagitapi.origin.clocktower.repository;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerSessionSeat;
import org.springframework.data.jpa.repository.JpaRepository;

/** 저장 전용. 조회는 BgmAgitClockTowerSessionRepository 의 QueryDSL 메서드로 한다 */
public interface BgmAgitClockTowerSessionSeatRepository extends JpaRepository<BgmAgitClockTowerSessionSeat, Long> {
}
