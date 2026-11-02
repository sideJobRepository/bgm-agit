package com.bgmagitapi.origin.entity;

import com.bgmagitapi.origin.entity.enumeration.ReservationChangeSettleType;
import com.bgmagitapi.origin.entity.enumeration.ReservationChangeStatus;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 예약 룸/인원 변경 요청·이력.
 *
 * 증원은 추가결제가 승인되는 순간에 반영해야 해서 "무엇을 무엇으로 바꾸려 했는지"를 결제 전까지 들고 있을 곳이 필요하다.
 * 승인 시 예약의 지금 인원·방이 BEFORE 와 같은지 다시 보고 AFTER 로 바꾼다 — 그 사이 다른 변경이 끼었으면 승인하지 않는다.
 * 즉시 반영된 변경(감소·룸만 이동·관리자 현장 처리)도 APPLIED 로 남겨 응대 근거로 쓴다.
 */
@Entity
@Table(name = "BGM_AGIT_RESERVATION_CHANGE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitReservationChange extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_RESERVATION_CHANGE_ID")
    private Long bgmAgitReservationChangeId;

    /**
     * 대상 예약 id. <b>물리 FK 를 걸지 않는다</b> — 결제취소 이력(BGM_AGIT_PAYMENT_CANCEL)과 같은 이유로,
     * 예약·결제행을 잠근 트랜잭션 안팎에서 이 행을 쓰다가 부모 행 공유 잠금을 기다리는 데드락을 피한다.
     */
    @Column(name = "BGM_AGIT_RESERVATION_ID")
    private Long bgmAgitReservationId;

    // 요청한 회원(손님 본인 또는 관리자)
    @Column(name = "BGM_AGIT_MEMBER_ID")
    private Long bgmAgitMemberId;

    @Column(name = "BGM_AGIT_BEFORE_PEOPLE")
    private Integer bgmAgitBeforePeople;

    @Column(name = "BGM_AGIT_AFTER_PEOPLE")
    private Integer bgmAgitAfterPeople;

    // 방 id 목록 "12,13" (오름차순)
    @Column(name = "BGM_AGIT_BEFORE_ROOM_IDS")
    private String bgmAgitBeforeRoomIds;

    @Column(name = "BGM_AGIT_AFTER_ROOM_IDS")
    private String bgmAgitAfterRoomIds;

    // 추가결제액(+) / 환불액(−) / 0
    @Column(name = "BGM_AGIT_DIFF_AMOUNT")
    private Integer bgmAgitDiffAmount;

    @Column(name = "BGM_AGIT_CHANGE_STATUS")
    @Enumerated(EnumType.STRING)
    private ReservationChangeStatus bgmAgitChangeStatus;

    @Column(name = "BGM_AGIT_SETTLE_TYPE")
    @Enumerated(EnumType.STRING)
    private ReservationChangeSettleType bgmAgitSettleType;

    // 추가결제 결제행 id(승인되면). 그 외 null
    @Column(name = "BGM_AGIT_PAYMENT_ID")
    private Long bgmAgitPaymentId;

    /** 즉시 반영한 감소의 환불 결과를 기록한다. 환불은 DB 변경을 flush 한 뒤 마지막에 부르므로 결과를 나중에 채운다 */
    public void recordRefund(int refundedAmount) {
        this.bgmAgitDiffAmount = -Math.max(refundedAmount, 0);
        this.bgmAgitSettleType = ReservationChangeSettleType.REFUND;
    }

    public BgmAgitReservationChange(Long reservationId, Long memberId,
                                    Integer beforePeople, Integer afterPeople,
                                    Collection<Long> beforeRoomIds, Collection<Long> afterRoomIds,
                                    int diffAmount,
                                    ReservationChangeStatus status,
                                    ReservationChangeSettleType settleType) {
        this.bgmAgitReservationId = reservationId;
        this.bgmAgitMemberId = memberId;
        this.bgmAgitBeforePeople = beforePeople;
        this.bgmAgitAfterPeople = afterPeople;
        this.bgmAgitBeforeRoomIds = joinRoomIds(beforeRoomIds);
        this.bgmAgitAfterRoomIds = joinRoomIds(afterRoomIds);
        this.bgmAgitDiffAmount = diffAmount;
        this.bgmAgitChangeStatus = status;
        this.bgmAgitSettleType = settleType;
    }

    public boolean isPending() {
        return this.bgmAgitChangeStatus == ReservationChangeStatus.PENDING;
    }

    /** 추가결제 승인으로 반영됨 */
    public void markApplied(Long paymentId, ReservationChangeSettleType settleType) {
        this.bgmAgitChangeStatus = ReservationChangeStatus.APPLIED;
        this.bgmAgitPaymentId = paymentId;
        this.bgmAgitSettleType = settleType;
    }

    public List<Long> getBeforeRoomIdList() {
        return parseRoomIds(this.bgmAgitBeforeRoomIds);
    }

    public List<Long> getAfterRoomIdList() {
        return parseRoomIds(this.bgmAgitAfterRoomIds);
    }

    /** 순서·중복과 무관하게 비교하려고 오름차순 중복 제거로 저장한다 */
    public static String joinRoomIds(Collection<Long> roomIds) {
        if (roomIds == null) {
            return "";
        }
        return roomIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
    }

    public static List<Long> parseRoomIds(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::valueOf)
                .toList();
    }
}
