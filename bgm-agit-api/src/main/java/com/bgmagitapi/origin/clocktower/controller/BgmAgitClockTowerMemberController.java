package com.bgmagitapi.origin.clocktower.controller;

import com.bgmagitapi.origin.advice.exception.ForbiddenException;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerMemberOption;
import com.bgmagitapi.origin.clocktower.repository.query.ClockTowerMemberSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** 시계탑 진행판 참가자 검색(닉네임). 이야기꾼은 그때그때 다르므로 로그인만 확인한다 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitClockTowerMemberController {

    // 한 글자부터 찾는다. 빈 검색어는 전 회원이 쏟아지니 빈 목록
    private static final int MIN_KEYWORD = 1;

    private final ClockTowerMemberSearchRepository memberSearchRepository;

    @GetMapping("/clocktower-members")
    @Transactional(readOnly = true)
    public List<ClockTowerMemberOption> searchMembers(@AuthenticationPrincipal Jwt jwt,
                                                      @RequestParam(name = "keyword", required = false) String keyword) {
        if (jwt == null) {
            throw new ForbiddenException("로그인이 필요합니다.");
        }
        String kw = keyword == null ? "" : keyword.trim();
        if (kw.length() < MIN_KEYWORD) return List.of();
        return memberSearchRepository.searchByNickname(kw);
    }
}
