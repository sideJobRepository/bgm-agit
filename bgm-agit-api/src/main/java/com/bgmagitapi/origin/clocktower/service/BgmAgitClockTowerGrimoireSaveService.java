package com.bgmagitapi.origin.clocktower.service;

import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerGrimoireSaveRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerGrimoireSaveResponse;

import java.util.List;

public interface BgmAgitClockTowerGrimoireSaveService {

    /** 저장하고 저장 id 를 돌려준다(id 가 있으면 덮어쓰기) */
    Long save(Long memberId, boolean admin, ClockTowerGrimoireSaveRequest request);

    /** 내 임시저장 목록(마도서 상태는 빼고) */
    List<ClockTowerGrimoireSaveResponse> mine(Long memberId);

    /** 하나 열기(저장한 회원·관리자만) */
    ClockTowerGrimoireSaveResponse get(Long id, Long memberId, boolean admin);

    void delete(Long id, Long memberId, boolean admin);
}
