package com.bgmagitapi.origin.clocktower.entity;

import com.bgmagitapi.origin.clocktower.util.ClockTowerSessionRules;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 진행판 세션의 좌석 1개 = 플레이어 1명에게 보여줄 내용.
 * ROLE_KEY 는 플레이어가 "보는" 캐릭터다 — 주정뱅이·꼭두각시·미치광이는 믿는 캐릭터만 올라오고 진짜 정체는 서버에 없다.
 * ROLE_KEY: 사전 키 또는 "c{캐릭터ID}"(직접 입력 캐릭터). EVIL: 보여줄 선악(Y/N, null=캐릭터 기본 진영).
 * INFO: 이야기꾼이 보내는 정보 JSON {title, lines}. VERSION 은 내용이 바뀔 때만 올라가고, 플레이어가 확인하면 VIEWED_VERSION 이 따라온다.
 */
@Entity
@Table(name = "BGM_AGIT_CLOCKTOWER_SESSION_SEAT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitClockTowerSessionSeat extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_CLOCKTOWER_SESSION_SEAT_ID")
    private Long id;

    @Column(name = "BGM_AGIT_CLOCKTOWER_SESSION_ID")
    private Long sessionId;

    @Column(name = "BGM_AGIT_MEMBER_ID")
    private Long memberId;

    @Column(name = "BGM_AGIT_CLOCKTOWER_SESSION_SEAT_NO")
    private Integer seatNo;

    @Column(name = "BGM_AGIT_CLOCKTOWER_SESSION_SEAT_ROLE_KEY")
    private String roleKey;

    @Column(name = "BGM_AGIT_CLOCKTOWER_SESSION_SEAT_EVIL")
    private String evil;

    @Column(name = "BGM_AGIT_CLOCKTOWER_SESSION_SEAT_INFO")
    private String info;

    @Column(name = "BGM_AGIT_CLOCKTOWER_SESSION_SEAT_VERSION")
    private Integer version;

    @Column(name = "BGM_AGIT_CLOCKTOWER_SESSION_SEAT_VIEWED_VERSION")
    private Integer viewedVersion;

    @Column(name = "BGM_AGIT_CLOCKTOWER_SESSION_SEAT_VIEWED_AT")
    private LocalDateTime viewedAt;

    public BgmAgitClockTowerSessionSeat(Long sessionId, Long memberId, Integer seatNo,
                                        String roleKey, String evil, String info) {
        this.sessionId = sessionId;
        this.memberId = memberId;
        this.seatNo = seatNo;
        this.roleKey = roleKey;
        this.evil = evil;
        this.info = info;
        this.version = 1;
        this.viewedVersion = 0;
    }

    /** 내용이 실제로 바뀌었을 때만 반영하고 version 을 올린다. 바뀌었으면 true */
    public boolean apply(Integer seatNo, String roleKey, String evil, String info) {
        if (!ClockTowerSessionRules.isChanged(this.seatNo, this.roleKey, this.evil, this.info,
                seatNo, roleKey, evil, info)) {
            return false;
        }
        this.seatNo = seatNo;
        this.roleKey = roleKey;
        this.evil = evil;
        this.info = info;
        this.version = (this.version == null ? 0 : this.version) + 1;
        return true;
    }

    /** 플레이어 확인. 지금 버전보다 큰 값은 받지 않고, 뒤로 가지 않는다 */
    public void markViewed(int version, LocalDateTime now) {
        this.viewedVersion = ClockTowerSessionRules.nextViewedVersion(this.viewedVersion, version, this.version);
        this.viewedAt = now;
    }
}
