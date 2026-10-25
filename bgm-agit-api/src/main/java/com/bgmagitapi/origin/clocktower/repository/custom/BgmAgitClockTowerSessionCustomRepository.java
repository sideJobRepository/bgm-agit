package com.bgmagitapi.origin.clocktower.repository.custom;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerSessionSeat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BgmAgitClockTowerSessionCustomRepository {

    /** 이 이야기꾼의 ACTIVE 세션을 전부 닫는다(새 세션을 열기 전) */
    long closeActiveByStoryteller(Long storytellerMemberId, LocalDateTime now);

    /** 세션의 좌석 전체(좌석 번호순) */
    List<BgmAgitClockTowerSessionSeat> findSeats(Long sessionId);

    /** 세션에서 그 회원의 좌석 */
    Optional<BgmAgitClockTowerSessionSeat> findSeat(Long sessionId, Long memberId);

    /** 내가 앉은 ACTIVE 세션 중 가장 최근 것의 내 좌석. createdAfter 이전에 만든 세션은 만료로 본다 */
    Optional<BgmAgitClockTowerSessionSeat> findLatestActiveSeat(Long memberId, LocalDateTime createdAfter);
}
