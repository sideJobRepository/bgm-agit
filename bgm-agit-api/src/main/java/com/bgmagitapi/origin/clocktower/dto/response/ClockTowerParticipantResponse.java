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
    private Boolean win;       // 세션 결과 대비 개인 승패 (선악/결과 없으면 null)
    private Boolean evil;      // 직접 지정한 최종 선악(진영이 바뀐 경우·여행자). null 이면 역할군대로

    public static ClockTowerParticipantResponse from(BgmAgitClockTowerParticipant p, ClockTowerResult result) {
        ClockTowerCharacterType type = p.getCharacterType();
        Boolean evilSide = p.resolveEvil();
        Boolean win = null;
        if (evilSide != null && result != null) {
            win = evilSide == (result == ClockTowerResult.EVIL_WIN);
        }
        return ClockTowerParticipantResponse.builder()
                .memberId(p.getBgmAgitMember() != null ? p.getBgmAgitMember().getBgmAgitMemberId() : null)
                .nickname(p.getBgmAgitMember() != null ? p.getBgmAgitMember().getBgmAgitMemberNickname() : null)
                .characterName(p.getCharacterName())
                .type(type != null ? type.name() : null)
                .typeName(type != null ? type.getValue() : null)
                .win(win)
                .evil(p.getEvil() == null ? null : "Y".equals(p.getEvil()))
                .build();
    }
}
