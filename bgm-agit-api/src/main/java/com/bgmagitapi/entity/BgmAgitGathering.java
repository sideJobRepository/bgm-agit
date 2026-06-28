package com.bgmagitapi.entity;

import com.bgmagitapi.entity.enumeration.GatheringStatus;
import com.bgmagitapi.entity.enumeration.GatheringType;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 머더미스터리 / 시계탑 모임 (사람 모으기)
 * - gatheringStatus : 모임 성사 상태 (참가자 좌석 상태와 별개)
 */
@Entity
@Table(name = "BGM_AGIT_GATHERING")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitGathering extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_GATHERING_ID")
    private Long bgmAgitGatheringId;

    // 모임 생성 관리자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;

    // 모임 종류 (머더미스터리 / 시계탑)
    @Column(name = "BGM_AGIT_GATHERING_TYPE")
    @Enumerated(EnumType.STRING)
    private GatheringType gatheringType;

    @Column(name = "BGM_AGIT_GATHERING_TITLE")
    private String title;

    // 시나리오명 (선택)
    @Column(name = "BGM_AGIT_SCENARIO_NAME")
    private String scenarioName;

    @Column(name = "BGM_AGIT_GATHERING_PLACE")
    private String place;

    @Column(name = "BGM_AGIT_GATHERING_DESCRIPTION", length = 4000)
    private String description;

    @Column(name = "BGM_AGIT_GATHERING_DATE")
    private LocalDate gatheringDate;

    @Column(name = "BGM_AGIT_GATHERING_START_TIME")
    private LocalTime startTime;

    @Column(name = "BGM_AGIT_GATHERING_END_TIME")
    private LocalTime endTime;

    @Column(name = "BGM_AGIT_GATHERING_MIN_PEOPLE")
    private Integer minPeople;

    @Column(name = "BGM_AGIT_GATHERING_MAX_PEOPLE")
    private Integer maxPeople;

    // 모집 마감 시각
    @Column(name = "BGM_AGIT_RECRUIT_DEADLINE")
    private LocalDateTime recruitDeadline;

    // 모임 성사 상태
    @Column(name = "BGM_AGIT_GATHERING_STATUS")
    @Enumerated(EnumType.STRING)
    private GatheringStatus gatheringStatus;

    public BgmAgitGathering(BgmAgitMember member,
                            GatheringType gatheringType,
                            String title,
                            String scenarioName,
                            String place,
                            String description,
                            LocalDate gatheringDate,
                            LocalTime startTime,
                            LocalTime endTime,
                            Integer minPeople,
                            Integer maxPeople,
                            LocalDateTime recruitDeadline) {
        this.bgmAgitMember = member;
        this.gatheringType = gatheringType;
        this.title = title;
        this.scenarioName = scenarioName;
        this.place = place;
        this.description = description;
        this.gatheringDate = gatheringDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.minPeople = minPeople;
        this.maxPeople = maxPeople;
        this.recruitDeadline = recruitDeadline;
        this.gatheringStatus = GatheringStatus.RECRUITING;
    }

    public void update(GatheringType gatheringType,
                       String title,
                       String scenarioName,
                       String place,
                       String description,
                       LocalDate gatheringDate,
                       LocalTime startTime,
                       LocalTime endTime,
                       Integer minPeople,
                       Integer maxPeople,
                       LocalDateTime recruitDeadline) {
        this.gatheringType = gatheringType;
        this.title = title;
        this.scenarioName = scenarioName;
        this.place = place;
        this.description = description;
        this.gatheringDate = gatheringDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.minPeople = minPeople;
        this.maxPeople = maxPeople;
        this.recruitDeadline = recruitDeadline;
    }

    public void markConfirmed() {
        this.gatheringStatus = GatheringStatus.CONFIRMED;
    }

    public void markCancelled() {
        this.gatheringStatus = GatheringStatus.CANCELLED;
    }

    public void markCompleted() {
        this.gatheringStatus = GatheringStatus.COMPLETED;
    }

    public LocalDateTime getStartDateTime() {
        if (gatheringDate == null || startTime == null) return null;
        return LocalDateTime.of(gatheringDate, startTime);
    }
}
