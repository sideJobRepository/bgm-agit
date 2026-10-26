package com.bgmagitapi.origin.clocktower.repository;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerGrimoireSave;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BgmAgitClockTowerGrimoireSaveRepository extends JpaRepository<BgmAgitClockTowerGrimoireSave, Long> {

    List<BgmAgitClockTowerGrimoireSave> findByMemberIdOrderByModifyDateDesc(Long memberId);
}
