package com.bgmagitapi.origin.event.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * 시계탑 캐릭터 배정·변경 알림톡.
 * 캐릭터 이름·진영은 휴대폰 화면과 같은 값(주정뱅이 등은 믿는 캐릭터)을 트랜잭션 안에서 풀어 담는다.
 * 리스너는 커밋 뒤 비동기로 돌아 세션 표를 다시 읽을 수 없으므로 보낼 값을 그대로 들고 간다.
 */
@Getter
@AllArgsConstructor
public class ClockTowerRoleTalkEvent {

    private final Long sessionId;
    private final List<Target> targets;

    public record Target(Long memberId, String gameName, String roleName, String teamName) {
    }
}
