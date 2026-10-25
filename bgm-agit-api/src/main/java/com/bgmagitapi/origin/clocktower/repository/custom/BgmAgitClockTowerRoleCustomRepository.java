package com.bgmagitapi.origin.clocktower.repository.custom;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerRole;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;

import java.util.Collection;
import java.util.List;

public interface BgmAgitClockTowerRoleCustomRepository {

    /** 공식 캐릭터 + 밤 특수 단계 전체(자작 캐릭터 제외) */
    List<BgmAgitClockTowerRole> findOfficialRoles();

    /** 관리 화면 목록. team 이 null 이면 전체, keyword 는 한글·영문 이름 */
    List<BgmAgitClockTowerRole> searchOfficialRoles(ClockTowerCharacterType team, String keyword);

    List<BgmAgitClockTowerRole> findByRoleKeys(Collection<String> roleKeys);

    /** 사전 문구가 바뀌면 그 캐릭터를 쓰는 시나리오 캐릭터 행(기록 화면이 읽는 이름·설명)도 맞춘다 */
    long syncCharacters(String roleKey, String name, ClockTowerCharacterType type, String ability);

    /** 자작 캐릭터 정리(게임 하드 삭제 시) */
    long deleteByGameId(Long gameId);
}
