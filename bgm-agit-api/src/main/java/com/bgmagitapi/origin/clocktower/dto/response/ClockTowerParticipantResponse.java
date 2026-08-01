package com.bgmagitapi.origin.clocktower.dto.response;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerParticipant;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerResult;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ClockTowerParticipantResponse {

    private Long memberId;
    private String nickname;
    private String characterName;
    private String type;       // TOWNSFOLK / OUTSIDER / MINION / DEMON
    private String typeName;   // 마을주민 / 외부인 / 하수인 / 악마
    private Boolean win;       // 세션 결과 대비 개인 승패 (역할군/결과 없으면 null)

    public static ClockTowerParticipantResponse from(BgmAgitClockTowerParticipant p, ClockTowerResult result) {
        ClockTowerCharacterType type = p.getCharacterType();
        Boolean win = null;
        if (type != null && result != null) {
            win = type.isEvil() == (result == ClockTowerResult.EVIL_WIN);
        }
        return ClockTowerParticipantResponse.builder()
                .memberId(p.getBgmAgitMember() != null ? p.getBgmAgitMember().getBgmAgitMemberId() : null)
                .nickname(p.getBgmAgitMember() != null ? p.getBgmAgitMember().getBgmAgitMemberNickname() : null)
                .characterName(p.getCharacterName())
                .type(type != null ? type.name() : null)
                .typeName(type != null ? type.getValue() : null)
                .win(win)
                .build();
    }
}
