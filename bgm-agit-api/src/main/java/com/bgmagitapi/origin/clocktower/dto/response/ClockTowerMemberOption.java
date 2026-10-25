package com.bgmagitapi.origin.clocktower.dto.response;

/** 시계탑 참가자 검색 결과. 이름·연락처는 내리지 않는다(닉네임만) */
public record ClockTowerMemberOption(Long id, String nickname) {
}
