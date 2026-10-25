package com.bgmagitapi.origin.clocktower.repository.custom;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerGame;

import java.util.Optional;

public interface BgmAgitClockTowerGameCustomRepository {

    /** 공식 기본 스크립트(tb/bmr/snv) 게임. 숨김 상태여도 찾는다(가져오기가 같은 행을 갱신하도록) */
    Optional<BgmAgitClockTowerGame> findByScriptKey(String scriptKey);
}
