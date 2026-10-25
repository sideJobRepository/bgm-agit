package com.bgmagitapi.origin.clocktower.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 징크스: 두 캐릭터가 같은 스크립트에 있을 때 바뀌는 규칙. 공식 데이터에서 가져온다.
 * ROLE_A 가 공식 데이터에서 징크스를 가진 쪽, ROLE_B 가 상대(둘 다 ROLE_KEY).
 */
@Entity
@Table(name = "BGM_AGIT_CLOCKTOWER_JINX")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitClockTowerJinx extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_CLOCKTOWER_JINX_ID")
    private Long id;

    @Column(name = "BGM_AGIT_CLOCKTOWER_JINX_ROLE_A")
    private String roleA;

    @Column(name = "BGM_AGIT_CLOCKTOWER_JINX_ROLE_B")
    private String roleB;

    @Column(name = "BGM_AGIT_CLOCKTOWER_JINX_REASON")
    private String reason;

    public BgmAgitClockTowerJinx(String roleA, String roleB, String reason) {
        this.roleA = roleA;
        this.roleB = roleB;
        this.reason = reason;
    }

    public void changeReason(String reason) {
        this.reason = reason;
    }
}
