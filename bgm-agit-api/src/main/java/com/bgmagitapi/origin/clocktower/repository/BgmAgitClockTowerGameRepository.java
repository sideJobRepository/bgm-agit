package com.bgmagitapi.origin.clocktower.repository;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerGame;
import com.bgmagitapi.origin.clocktower.repository.custom.BgmAgitClockTowerGameCustomRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BgmAgitClockTowerGameRepository extends JpaRepository<BgmAgitClockTowerGame, Long>,
        BgmAgitClockTowerGameCustomRepository {

    Page<BgmAgitClockTowerGame> findByUseStatusAndNameContaining(String useStatus, String name, Pageable pageable);

    List<BgmAgitClockTowerGame> findByUseStatusOrderByNameAsc(String useStatus);
}
