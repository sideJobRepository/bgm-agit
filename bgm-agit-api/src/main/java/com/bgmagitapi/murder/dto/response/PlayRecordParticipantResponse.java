package com.bgmagitapi.murder.dto.response;

import com.bgmagitapi.murder.entity.BgmAgitPlayRecordParticipant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PlayRecordParticipantResponse {

    private Long memberId;
    private String nickname;

    public static PlayRecordParticipantResponse from(BgmAgitPlayRecordParticipant p) {
        return PlayRecordParticipantResponse.builder()
                .memberId(p.getBgmAgitMember() != null ? p.getBgmAgitMember().getBgmAgitMemberId() : null)
                .nickname(p.getBgmAgitMember() != null ? p.getBgmAgitMember().getBgmAgitMemberNickname() : null)
                .build();
    }
}
