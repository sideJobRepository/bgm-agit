package com.bgmagitapi.origin.clocktower.repository.custom;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerCharacter;

import java.util.Optional;

public interface BgmAgitClockTowerCharacterCustomRepository {

    /** 이 게임(스크립트)의 그 사전 키 캐릭터 */
    Optional<BgmAgitClockTowerCharacter> findInGameByRoleKey(Long gameId, String roleKey);
}
