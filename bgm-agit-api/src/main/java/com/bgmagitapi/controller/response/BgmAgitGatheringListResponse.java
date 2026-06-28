package com.bgmagitapi.controller.response;

import com.bgmagitapi.entity.BgmAgitGathering;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Builder
public class BgmAgitGatheringListResponse {

    private Long gatheringId;
    private String gatheringType;       // MURDER_MYSTERY / CLOCK_TOWER
    private String gatheringTypeName;   // 머더미스터리 / 시계탑
    private String title;
    private String scenarioName;
    private String place;
    private LocalDate gatheringDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer minPeople;
    private Integer maxPeople;
    private LocalDateTime recruitDeadline;
    private String gatheringStatus;       // RECRUITING / CONFIRMED / CANCELLED / COMPLETED
    private String gatheringStatusName;   // 모집중 / 성사 / 무산 / 종료

    // 좌석확보 인원 / 대기 인원 / 유연(다른 장르도 가능) 신청 인원
    private long confirmedCount;
    private long waitingCount;
    private long flexibleCount;

    // 성사까지 남은 인원 (0이면 이미 성사 가능)
    private long neededToConfirm;

    // 주최자(모임 만든 회원) 닉네임
    private String hostNickname;

    public static BgmAgitGatheringListResponse of(BgmAgitGathering g,
                                                  long confirmedCount,
                                                  long waitingCount,
                                                  long flexibleCount) {
        long needed = Math.max(0, (g.getMinPeople() == null ? 0 : g.getMinPeople()) - confirmedCount);
        return BgmAgitGatheringListResponse.builder()
                .gatheringId(g.getBgmAgitGatheringId())
                .gatheringType(g.getGatheringType() != null ? g.getGatheringType().name() : null)
                .gatheringTypeName(g.getGatheringType() != null ? g.getGatheringType().getValue() : null)
                .title(g.getTitle())
                .scenarioName(g.getScenarioName())
                .place(g.getPlace())
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
                .hostNickname(g.getBgmAgitMember() != null ? g.getBgmAgitMember().getBgmAgitMemberNickname() : null)
                .build();
    }
}
