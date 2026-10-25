package com.bgmagitapi.origin.clocktower.repository;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerCharacter;
import com.bgmagitapi.origin.clocktower.repository.custom.BgmAgitClockTowerCharacterCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BgmAgitClockTowerCharacterRepository extends JpaRepository<BgmAgitClockTowerCharacter, Long>,
        BgmAgitClockTowerCharacterCustomRepository {

    List<BgmAgitClockTowerCharacter> findByGame_IdOrderByOrdersAsc(Long gameId);

    void deleteByGame_Id(Long gameId);
}
