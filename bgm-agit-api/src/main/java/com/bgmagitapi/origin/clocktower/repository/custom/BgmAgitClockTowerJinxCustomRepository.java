package com.bgmagitapi.origin.clocktower.repository.custom;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerJinx;

import java.util.Collection;
import java.util.List;

public interface BgmAgitClockTowerJinxCustomRepository {

    /** 두 캐릭터가 모두 주어진 목록 안에 있는 징크스(스크립트에 실제로 걸리는 것만) */
    List<BgmAgitClockTowerJinx> findAmong(Collection<String> roleKeys);
}
