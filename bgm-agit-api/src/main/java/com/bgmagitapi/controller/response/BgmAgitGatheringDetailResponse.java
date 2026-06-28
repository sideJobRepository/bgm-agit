package com.bgmagitapi.controller.response;

import com.bgmagitapi.entity.BgmAgitGathering;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter
@Builder
public class BgmAgitGatheringDetailResponse {

    private Long gatheringId;
    private String gatheringType;
    private String gatheringTypeName;
    private String title;
    private String scenarioName;
    private String place;
    private String description;
    private LocalDate gatheringDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer minPeople;
    private Integer maxPeople;
    private LocalDateTime recruitDeadline;
    private String gatheringStatus;
    private String gatheringStatusName;

    private long confirmedCount;
    private long waitingCount;
    private long flexibleCount;
    private long neededToConfirm;

    // 주최자(모임 만든 회원)
    private Long hostMemberId;
    private String hostNickname;

    // 좌석확보 명단 (닉네임만 공개) + 대기 명단
    private List<BgmAgitGatheringParticipantResponse> confirmed;
    private List<BgmAgitGatheringParticipantResponse> waiting;

    // 로그인 사용자 본인의 참가 상태 (null 이면 미신청)
    private String myStatus;
    private Boolean myFlexible;

    // 관리자용 전체 명단 (참석/노쇼/입금 포함) — 비관리자에게는 null
    private List<BgmAgitGatheringParticipantResponse> adminParticipants;

    public static BgmAgitGatheringDetailResponse.BgmAgitGatheringDetailResponseBuilder base(BgmAgitGathering g,
                                                                                            long confirmedCount,
                                                                                            long waitingCount,
                                                                                            long flexibleCount) {
        long needed = Math.max(0, (g.getMinPeople() == null ? 0 : g.getMinPeople()) - confirmedCount);
        return BgmAgitGatheringDetailResponse.builder()
                .gatheringId(g.getBgmAgitGatheringId())
                .gatheringType(g.getGatheringType() != null ? g.getGatheringType().name() : null)
                .gatheringTypeName(g.getGatheringType() != null ? g.getGatheringType().getValue() : null)
                .title(g.getTitle())
                .scenarioName(g.getScenarioName())
                .place(g.getPlace())
                .description(g.getDescription())
                .gatheringDate(g.getGatheringDate())
                .startTime(g.getStartTime())
                .endTime(g.getEndTime())
                .minPeople(g.getMinPeople())
                .maxPeople(g.getMaxPeople())
                .recruitDeadline(g.getRecruitDeadline())
                .gatheringStatus(g.getGatheringStatus() != null ? g.getGatheringStatus().name() : null)
                .gatheringStatusName(g.getGatheringStatus() != null ? g.getGatheringStatus().getValue() : null)
                .confirmedCount(confirmedCount)
                .waitingCount(waitingCount)
                .flexibleCount(flexibleCount)
                .neededToConfirm(needed)
                .hostMemberId(g.getBgmAgitMember() != null ? g.getBgmAgitMember().getBgmAgitMemberId() : null)
                .hostNickname(g.getBgmAgitMember() != null ? g.getBgmAgitMember().getBgmAgitMemberNickname() : null);
    }
}
