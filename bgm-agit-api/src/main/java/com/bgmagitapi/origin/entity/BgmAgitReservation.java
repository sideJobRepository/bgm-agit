package com.bgmagitapi.origin.entity;

import com.bgmagitapi.origin.entity.enumeration.Reservation;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import com.bgmagitapi.origin.util.SlotSchedule;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 예약 1건 = 1행. 시간은 이어진 한 구간(시작~종료)이다.
 *
 * 예전에는 슬롯마다 한 행씩 쌓고 중복값인 RESERVATION_NO 로 묶었다. 그래서 단건 조회가 터지고
 * 페이징을 2단계로 해야 했고, 상태 변경도 행 id 목록 벌크 업데이트였다.
 * 이관 시 RESERVATION_ID = 구 RESERVATION_NO 로 옮겨서 결제·토스 orderId·알림톡 이력의 값이 그대로 이어진다.
 *
 * 종료가 시작보다 이르거나 같으면 익일이다(23:00~02:00, 10:00~10:00 하루 전체). 실제 일시는
 * {@link SlotSchedule#useRange} 로만 계산할 것.
 */
@Entity
@Table(name = "BGM_AGIT_RESERVATION")
// 상태·인원 변경은 더티체킹이다. 바뀐 컬럼만 써야 동시에 돈 결제 승인과 취소·인원변경이
// 처음 읽은 스냅샷으로 상대 쪽 컬럼을 덮어쓰지 않는다.
@DynamicUpdate
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitReservation extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_RESERVATION_ID")
    private Long bgmAgitReservationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;

    @Column(name = "BGM_AGIT_RESERVATION_TYPE")
    @Enumerated(EnumType.STRING)
    private Reservation reservation;

    // 영업일. 하루 경계(SlotSchedule.DAY_BOUNDARY) 이전 시각은 이 날짜의 익일 새벽이다
    @Column(name = "BGM_AGIT_RESERVATION_START_DATE")
    private LocalDate bgmAgitReservationStartDate;

    @Column(name = "BGM_AGIT_RESERVATION_START_TIME")
    private LocalTime bgmAgitReservationStartTime;

    @Column(name = "BGM_AGIT_RESERVATION_END_TIME")
    private LocalTime bgmAgitReservationEndTime;

    @Column(name = "BGM_AGIT_RESERVATION_PEOPLE")
    private Integer bgmAgitReservationPeople;

    @Column(name = "BGM_AGIT_RESERVATION_REQUEST")
    private String bgmAgitReservationRequest;

    // 'Y' 확정 / 'N' 대기
    @Column(name = "BGM_AGIT_RESERVATION_APPROVAL_STATUS")
    private String bgmAgitReservationApprovalStatus;

    // 'Y' 취소 / 'N'
    @Column(name = "BGM_AGIT_RESERVATION_CANCEL_STATUS")
    private String bgmAgitReservationCancelStatus;

    // 예약한 방들. 합쳐 예약이면 여러 개
    @OneToMany(mappedBy = "bgmAgitReservation", cascade = CascadeType.PERSIST)
    @OrderBy("bgmAgitReservationRoomId ASC")
    private List<BgmAgitReservationRoom> rooms = new ArrayList<>();

    public BgmAgitReservation(BgmAgitMember member,
                              Reservation reservationType,
                              LocalDate startDate,
                              LocalTime startTime,
                              LocalTime endTime,
                              Integer people,
                              String request) {
        this.bgmAgitMember = member;
        this.reservation = reservationType;
        this.bgmAgitReservationStartDate = startDate;
        this.bgmAgitReservationStartTime = startTime;
        this.bgmAgitReservationEndTime = endTime;
        this.bgmAgitReservationPeople = people;
        this.bgmAgitReservationRequest = request;
        this.bgmAgitReservationApprovalStatus = "N";
        this.bgmAgitReservationCancelStatus = "N";
    }

    public void addRoom(BgmAgitRoom room) {
        this.rooms.add(new BgmAgitReservationRoom(this, room));
    }

    // ===== 상태 =====

    /** 결제 승인 → 확정. 취소 여부는 건드리지 않는다 — 동시에 들어온 취소를 승인이 되살리면 안 된다. */
    public void approve() {
        this.bgmAgitReservationApprovalStatus = "Y";
    }

    public void cancel() {
        this.bgmAgitReservationCancelStatus = "Y";
    }

    /** 관리자/사용자 상태 변경(PUT /reservation). 값은 호출 전에 Y/N 으로 정규화되어 있어야 한다. */
    public void changeStatus(String cancelStatus, String approvalStatus) {
        this.bgmAgitReservationCancelStatus = cancelStatus;
        this.bgmAgitReservationApprovalStatus = approvalStatus;
    }

    public void changePeople(Integer people) {
        this.bgmAgitReservationPeople = people;
    }

    public boolean isCanceled() {
        return "Y".equalsIgnoreCase(this.bgmAgitReservationCancelStatus);
    }

    public boolean isApproved() {
        return "Y".equalsIgnoreCase(this.bgmAgitReservationApprovalStatus);
    }

    public Long getMemberId() {
        return this.bgmAgitMember == null ? null : this.bgmAgitMember.getBgmAgitMemberId();
    }

    // ===== 방 =====

    public List<BgmAgitRoom> getRoomList() {
        return this.rooms.stream()
                .map(BgmAgitReservationRoom::getBgmAgitRoom)
                .filter(Objects::nonNull)
                .toList();
    }

    public List<Long> getRoomIds() {
        return getRoomList().stream().map(BgmAgitRoom::getBgmAgitRoomId).distinct().toList();
    }

    /** 방 이름 목록(등록 순). 합쳐 예약이면 "M-1, M-2". */
    public String getRoomNames() {
        return getRoomList().stream()
                .map(BgmAgitRoom::getBgmAgitRoomName)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.joining(", "));
    }

    /** 마작 대탁 대여 예약인지. 합쳐 예약은 같은 링크끼리만 묶이므로 첫 방으로 판정한다. */
    public boolean isMahjong() {
        List<BgmAgitRoom> list = getRoomList();
        return !list.isEmpty() && list.get(0).isMahjong();
    }

    // ===== 시간 =====

    /** 실제 이용 구간 [start, end). */
    public SlotSchedule.Slot getUseRange() {
        return SlotSchedule.useRange(bgmAgitReservationStartDate, bgmAgitReservationStartTime, bgmAgitReservationEndTime);
    }

    /** 이용 시작 절대시각. 환불 비율(48h/24h)·결제/취소 가능 여부의 기준. */
    public LocalDateTime getUseStartAt() {
        SlotSchedule.Slot range = getUseRange();
        return range == null ? null : range.start();
    }
}
