package com.bgmagitapi.origin.clocktower.service;

import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerSessionCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerSessionSeatsRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerSessionViewedRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerMySeatResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerSessionStatusResponse;

/**
 * 진행판 세션 = 플레이어 휴대폰 "내 캐릭터". 서버에는 각 플레이어에게 보여줄 것만 둔다.
 * 이야기꾼 동작은 세션을 만든 회원 또는 관리자만(admin=true).
 */
public interface BgmAgitClockTowerSessionService {

    Long createSession(Long storytellerId, ClockTowerSessionCreateRequest request);

    int updateSeats(Long sessionId, Long memberId, boolean admin, ClockTowerSessionSeatsRequest request);

    ClockTowerSessionStatusResponse getStatus(Long sessionId, Long memberId, boolean admin);

    void closeSession(Long sessionId, Long memberId, boolean admin);

    /** 내가 앉은 ACTIVE 세션의 내 줄. 없으면 active=false */
    ClockTowerMySeatResponse getMySeat(Long memberId);

    void markViewed(Long memberId, ClockTowerSessionViewedRequest request);
}
