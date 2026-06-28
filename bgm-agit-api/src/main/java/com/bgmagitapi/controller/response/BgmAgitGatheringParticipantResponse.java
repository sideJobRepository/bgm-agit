package com.bgmagitapi.controller.response;

import com.bgmagitapi.entity.BgmAgitGatheringParticipant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BgmAgitGatheringParticipantResponse {

    private Long participantId;
    private Long memberId;
    private String nickname;
    private String status;       // CONFIRMED / WAITING / ...
    private String statusName;   // 좌석확보 / 대기 / ...
    private Boolean flexible;
    private Long appliedOrder;

    public static BgmAgitGatheringParticipantResponse from(BgmAgitGatheringParticipant p) {
        String nickname = p.getBgmAgitMember() != null ? p.getBgmAgitMember().getBgmAgitMemberNickname() : null;
        Long memberId = p.getBgmAgitMember() != null ? p.getBgmAgitMember().getBgmAgitMemberId() : null;
        return BgmAgitGatheringParticipantResponse.builder()
                .participantId(p.getBgmAgitGatheringParticipantId())
                .memberId(memberId)
                .nickname(nickname)
                .status(p.getParticipantStatus() != null ? p.getParticipantStatus().name() : null)
                .statusName(p.getParticipantStatus() != null ? p.getParticipantStatus().getValue() : null)
                .flexible(p.getFlexible())
                .appliedOrder(p.getAppliedOrder())
                .build();
    }
}
