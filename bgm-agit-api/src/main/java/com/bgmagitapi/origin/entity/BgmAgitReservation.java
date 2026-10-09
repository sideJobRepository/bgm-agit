package com.bgmagitapi.origin.entity;

import com.bgmagitapi.origin.entity.enumeration.Reservation;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import com.bgmagitapi.origin.util.SlotSchedule;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 예약 1건 = 1행. 시간은 이어진 한 구간(시작~종료)이고, 방은 BGM_AGIT_RESERVATION_ROOM 으로 붙는다
 * (합쳐 예약 M-1 + M-2 면 방 행이 2개).
 *
 * PK 값 = 이관 전 BGM_AGIT_RESERVATION_NO. 결제·토스 orderId·알림톡 이력 SUBJECT_ID 가 이 값을 그대로 가리킨다.
 * 종료 시각이 시작 이하이면 다음 날로 넘어간 것이다(23:00~02:00). 해석은 {@link SlotSchedule#toPeriod}.
 */
@Entity
@Table(name = "BGM_AGIT_RESERVATION")
// 상태 변경이 벌크 UPDATE 에서 더티체킹으로 바뀌었다. 바뀐 컬럼만 써야 동시에 들어온 다른 변경(취소 등)을
// 처음 읽은 스냅샷으로 덮어쓰지 않는다.
@DynamicUpdate
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitReservation extends DateSuperClass {
    // BGM 아지트 예약 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_RESERVATION_ID")
    private Long bgmAgitReservationId;
    
    // BGM 아지트 회원 ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;
    
    // BGM 아지트 예약 타입
    @Column(name = "BGM_AGIT_RESERVATION_TYPE")
    @Enumerated(EnumType.STRING)
    private Reservation reservation;
    
    // BGM 아지트 예약 시작 일시 (영업일)
    @Column(name = "BGM_AGIT_RESERVATION_START_DATE")
    private LocalDate bgmAgitReservationStartDate;
    
    // BGM 아지트 예약 시작 시간
    @Column(name = "BGM_AGIT_RESERVATION_START_TIME")
    private LocalTime bgmAgitReservationStartTime;
    
    // BGM 아지트 예약 종료 시간 (시작 이하이면 익일)
    @Column(name = "BGM_AGIT_RESERVATION_END_TIME")
    private LocalTime bgmAgitReservationEndTime;
    
    // BGM 아지트 예약 인원
    @Column(name = "BGM_AGIT_RESERVATION_PEOPLE")
    private Integer bgmAgitReservationPeople;
    // BGM 아지트 예약 요청사항
    @Column(name = "BGM_AGIT_RESERVATION_REQUEST")
    private String bgmAgitReservationRequest;
    
    // BGM 아지트 예약 승인 여부 'N'
    @Column(name = "BGM_AGIT_RESERVATION_APPROVAL_STATUS")
    private String bgmAgitReservationApprovalStatus;
    
    // BGM 아지트 예약 취소 여부 'N'
    @Column(name = "BGM_AGIT_RESERVATION_CANCEL_STATUS")
    private String bgmAgitReservationCancelStatus;

    // 예약한 방들. 저장은 예약과 함께(cascade) — 방 행만 따로 만들 일이 없다
    @OneToMany(mappedBy = "bgmAgitReservation", cascade = CascadeType.PERSIST)
    @OrderBy("bgmAgitReservationRoomId ASC")
    private List<BgmAgitReservationRoom> bgmAgitReservationRooms = new ArrayList<>();
    
    public BgmAgitReservation(BgmAgitMember member,
                              Reservation reservationType,
                              LocalDate reservationDate,
                              LocalTime startTime,
                              LocalTime endTime,
                              Integer reservationPeople,
                              String reservationRequest) {
        this.bgmAgitMember = member;
        this.reservation = reservationType;
        this.bgmAgitReservationStartDate = reservationDate;
        this.bgmAgitReservationStartTime = startTime;
        this.bgmAgitReservationEndTime = endTime;
        this.bgmAgitReservationApprovalStatus = "N";
        this.bgmAgitReservationCancelStatus = "N";
        this.bgmAgitReservationPeople = reservationPeople;
        this.bgmAgitReservationRequest = reservationRequest;
    }

    /** 방을 붙인다. 같은 방을 두 번 붙이지 않는다(DB 에도 UNIQUE(RESERVATION_ID, ROOM_ID)). */
    public void addRoom(BgmAgitRoom room) {
        boolean exists = bgmAgitReservationRooms.stream()
                .anyMatch(rr -> Objects.equals(rr.getBgmAgitRoom().getBgmAgitRoomId(), room.getBgmAgitRoomId()));
        if (!exists) {
            bgmAgitReservationRooms.add(new BgmAgitReservationRoom(this, room));
        }
    }

    /** 예약한 방 목록(붙인 순서). 첫 번째가 기준 방이다. */
    public List<BgmAgitRoom> getRooms() {
        return bgmAgitReservationRooms.stream()
                .map(BgmAgitReservationRoom::getBgmAgitRoom)
                .filter(Objects::nonNull)
                .toList();
    }

    public List<Long> getRoomIds() {
        return getRooms().stream().map(BgmAgitRoom::getBgmAgitRoomId).toList();
    }

    /** "M-1, M-2" 처럼 방 이름을 붙인 순서대로 잇는다. */
    public String getRoomNames() {
        return getRooms().stream()
                .map(BgmAgitRoom::getBgmAgitRoomName)
                .filter(StringUtils::hasText)
                .distinct()
                .collect(Collectors.joining(", "));
    }

    /** 마작 대여 예약인지(기준 방 링크). 알림톡 구분(RESERVATION / MAHJONG_RENTAL)에 쓴다. */
    public boolean isMahjong() {
        List<BgmAgitRoom> rooms = getRooms();
        return !rooms.isEmpty() && rooms.get(0).isMahjong();
    }

    /** 절대시각 구간. 자정을 넘기는 예약도 종료가 다음 날로 잡힌다. */
    public SlotSchedule.Slot getPeriod() {
        return SlotSchedule.toPeriod(bgmAgitReservationStartDate, bgmAgitReservationStartTime, bgmAgitReservationEndTime);
    }

    public boolean isCanceled() {
        return "Y".equalsIgnoreCase(bgmAgitReservationCancelStatus);
    }

    public boolean isApproved() {
        return "Y".equalsIgnoreCase(bgmAgitReservationApprovalStatus);
    }

    /** 결제 승인 → 확정. 취소 여부는 건드리지 않는다 — 취소된 예약을 승인이 되살리면 안 된다. */
    public void approve() {
        this.bgmAgitReservationApprovalStatus = "Y";
    }

    /**
     * 관리자·사용자 상태 변경(PUT /reservation). 값이 온 것만 바꾼다.
     * 예전엔 슬롯 행 id 목록으로 벌크 UPDATE 했지만 이제 1건이라 더티체킹으로 충분하다.
     */
    public void changeStatus(String cancelStatus, String approvalStatus) {
        if (StringUtils.hasText(cancelStatus)) {
            this.bgmAgitReservationCancelStatus = cancelStatus.toUpperCase();
        }
        if (StringUtils.hasText(approvalStatus)) {
            this.bgmAgitReservationApprovalStatus = approvalStatus.toUpperCase();
        }
    }
}
