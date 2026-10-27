package com.bgmagitapi.origin.clocktower.dto.response;

/**
 * 시계탑 참가자 검색 결과. 이름·연락처는 내리지 않는다(닉네임만).
 * loginType 은 소셜 회원일 때만 "카카오"·"네이버"·"구글"(자체로그인은 null) — 소셜과 자체로그인은 닉네임이 겹칠 수 있어 구분용으로 붙인다
 */
public record ClockTowerMemberOption(Long id, String nickname, String loginType) {
}
