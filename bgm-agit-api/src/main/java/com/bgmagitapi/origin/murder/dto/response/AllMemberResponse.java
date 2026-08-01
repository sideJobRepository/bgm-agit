package com.bgmagitapi.origin.murder.dto.response;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import lombok.Builder;
import lombok.Getter;

/**
 * 참가자 멀티셀렉트용 회원 검색 결과 (소셜/폼 전체).
 */
@Getter
@Builder
public class AllMemberResponse {

    private Long id;
    private String nickname;
    private String name;

    public static AllMemberResponse from(BgmAgitMember m) {
        return AllMemberResponse.builder()
                .id(m.getBgmAgitMemberId())
                .nickname(m.getBgmAgitMemberNickname())
                .name(m.getBgmAgitMemberName())
                .build();
    }
}
