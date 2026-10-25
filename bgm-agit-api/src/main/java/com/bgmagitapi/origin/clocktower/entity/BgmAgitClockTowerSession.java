package com.bgmagitapi.origin.clocktower.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 이야기꾼 진행판 한 판(플레이어 휴대폰 "내 캐릭터" 용).
 * 서버에는 각 플레이어에게 보여줄 것만 둔다(좌석 BgmAgitClockTowerSessionSeat). 진행 상태 전체는 여전히 진행판 기기에만 있다.
 * STATUS: ACTIVE / CLOSED. 생성 후 18시간이 지나면 ACTIVE 여도 닫힌 것으로 본다(ClockTowerSessionRules.isExpired).
 */
@Entity
@Table(name = "BGM_AGIT_CLOCKTOWER_SESSION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitClockTowerSession extends DateSuperClass {

    public static final String ACTIVE = "ACTIVE";
    public static final String CLOSED = "CLOSED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_CLOCKTOWER_SESSION_ID")
    private Long id;

    @Column(name = "BGM_AGIT_CLOCKTOWER_GAME_ID")
    private Long gameId;

    @Column(name = "BGM_AGIT_CLOCKTOWER_SESSION_STORYTELLER_ID")
    private Long storytellerMemberId;

    @Column(name = "BGM_AGIT_CLOCKTOWER_SESSION_STATUS")
    private String status;

    public BgmAgitClockTowerSession(Long gameId, Long storytellerMemberId) {
        this.gameId = gameId;
        this.storytellerMemberId = storytellerMemberId;
        this.status = ACTIVE;
    }

    public boolean isActive() {
        return ACTIVE.equals(status);
    }

    public void close() {
        this.status = CLOSED;
    }
}
