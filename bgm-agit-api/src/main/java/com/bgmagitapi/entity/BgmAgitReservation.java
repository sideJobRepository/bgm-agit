package com.bgmagitapi.entity;

import com.bgmagitapi.controller.response.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.entity.enumeration.Reservation;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "BGM_AGIT_RESERVATION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitReservation {
    // BGM 아지트 예약 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_RESERVATION_ID")
    private Long bgmAgitReservationId;
    
    // BGM 아지트 회원 ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_IMAGE_ID")
    private BgmAgitImage bgmAgitImage;
    
    // BGM 아지트 예약 타입
    @Column(name = "BGM_AGIT_RESERVATION_TYPE")
    @Enumerated(EnumType.STRING)
    private Reservation reservation;
    
    // BGM 아지트 예약 시작 일시
    @Column(name = "BGM_AGIT_RESERVATION_START_DATE")
    private LocalDate bgmAgitReservationStartDate;
    
    // BGM 아지트 예약 종료 일시
    @Column(name = "BGM_AGIT_RESERVATION_END_DATE")
    private LocalDate bgmAgitReservationEndDate;
    
    // BGM 아지트 예약 시작 시간
    @Column(name = "BGM_AGIT_RESERVATION_START_TIME")
    private LocalTime bgmAgitReservationStartTime;
    
    // BGM 아지트 예약 종료 시간
    @Column(name = "BGM_AGIT_RESERVATION_END_TIME")
    private LocalTime bgmAgitReservationEndTime;
    
    // BGM 아지트 예약 승인 여부 'N'
    @Column(name = "BGM_AGIT_RESERVATION_APPROVAL_STATUS")
    private String bgmAgitReservationApprovalStatus;
    
    public BgmAgitReservation(BgmAgitMember member, BgmAgitImage image, BgmAgitReservationCreateRequest request) {
        this.bgmAgitMember = member;
        this.bgmAgitImage = image;
        this.reservation = Reservation.valueOf(request.getBgmAgitReservationType());
        this.bgmAgitReservationStartDate = request.getBgmAgitReservationStartDate();
        this.bgmAgitReservationStartTime = request.getBgmAgitReservationStartTime();
        this.bgmAgitReservationEndTime = request.getBgmAgitReservationEndTime();
    }
}
