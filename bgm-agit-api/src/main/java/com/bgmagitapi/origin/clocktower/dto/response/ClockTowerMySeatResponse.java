package com.bgmagitapi.origin.clocktower.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 플레이어 휴대폰 "내 캐릭터". **내 줄만** 담는다 — 다른 좌석 정보는 절대 넣지 않는다.
 * 앉은 세션이 없으면 active=false 만 내려간다(컨트롤러가 {active:false} 로 응답).
 */
@Getter
@Builder
public class ClockTowerMySeatResponse {

    private boolean active;
    private Long sessionId;
    private Long gameId;
    private String gameName;
    private Integer seatNo;
    private Integer version;
    private Integer viewedVersion;
    private Role role;
    private Boolean evil;
    private Info info;

    @Getter
    @Builder
    public static class Role {
        private String key;
        private String name;
        private String team;
        private String teamName;
        private String ability;
        private String image;
    }

    @Getter
    @Builder
    public static class Info {
        private String title;
        private List<String> lines;
    }
}
