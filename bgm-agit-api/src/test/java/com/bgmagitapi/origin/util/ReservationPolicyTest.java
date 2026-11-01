package com.bgmagitapi.origin.util;

import com.bgmagitapi.origin.entity.BgmAgitRoom;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 예약 정책(일무제한 슬롯·최대 12시간·인원 × 단가·48h/24h 환불·월간패스 할인)을 못 박아 둔다.
 */
class ReservationPolicyTest {

    private static final LocalDate NOV_1 = LocalDate.of(2026, 11, 1);     // 일요일
    private static final LocalDate NOV_2 = LocalDate.of(2026, 11, 2);     // 월요일

    private static BgmAgitRoom room(long id, String name, String link, int min, int max) {
        BgmAgitRoom room = new BgmAgitRoom(name, link, min, max, null, null, "Y");
        ReflectionTestUtils.setField(room, "bgmAgitRoomId", id);
        return room;
    }

    private static final BgmAgitRoom B_ROOM = room(1, "B Room", BgmAgitRoom.LINK_ROOM, 4, 6);
    private static final BgmAgitRoom G_ROOM = room(2, "G Room", BgmAgitRoom.LINK_ROOM, 7, 12);
    private static final BgmAgitRoom M1 = room(3, "M-1", BgmAgitRoom.LINK_ROOM, 4, 7);
    private static final BgmAgitRoom M2 = room(4, "M-2", BgmAgitRoom.LINK_ROOM, 4, 7);
    private static final BgmAgitRoom TABLE = room(5, "대탁 1", BgmAgitRoom.LINK_MAHJONG, 4, 4);

    @Test
    @DisplayName("룸은 오전 10시부터 1시간 24칸, G룸도 같다")
    void roomSlots() {
        List<SlotSchedule.Slot> slots = SlotSchedule.of(B_ROOM, NOV_1).slots();
        assertThat(slots).hasSize(24);
        assertThat(slots.get(0).start()).isEqualTo(LocalDateTime.of(NOV_1, LocalTime.of(10, 0)));
        assertThat(slots.get(23).end()).isEqualTo(LocalDateTime.of(NOV_2, LocalTime.of(10, 0)));
        assertThat(SlotSchedule.of(G_ROOM, NOV_1).slots()).hasSize(24);
    }

    @Test
    @DisplayName("모든 방은 한 번에 최대 12시간 — 룸 12칸, 마작 대탁 4칸(3시간 칸)")
    void maxTwelveHours() {
        assertThat(SlotSchedule.maxSelectableSlots(B_ROOM, NOV_1)).isEqualTo(12);
        assertThat(SlotSchedule.maxSelectableSlots(G_ROOM, NOV_1)).isEqualTo(12);
        assertThat(SlotSchedule.maxSelectableSlots(M1, NOV_2)).isEqualTo(12);
        assertThat(SlotSchedule.maxSelectableSlots(TABLE, NOV_1)).isEqualTo(4);
    }

    @Test
    @DisplayName("마작 대탁은 3시간 4칸")
    void mahjongSlots() {
        assertThat(SlotSchedule.of(TABLE, NOV_1).slots()).hasSize(4);
    }

    @Test
    @DisplayName("룸은 인원 × 단가(합쳐 예약도 인원 기준 1회), 마작 대탁은 항목당 정액")
    void amount() {
        assertThat(SlotSchedule.isFlatPricing(List.of(B_ROOM), NOV_1)).isFalse();
        assertThat(SlotSchedule.totalPaymentAmount(List.of(B_ROOM), 5, true, NOV_1)).isEqualTo(50000);
        assertThat(SlotSchedule.totalPaymentAmount(List.of(B_ROOM), 5, false, NOV_2)).isEqualTo(45000);
        assertThat(SlotSchedule.totalPaymentAmount(List.of(M1, M2), 9, false, NOV_2)).isEqualTo(81000);
        assertThat(SlotSchedule.unitPriceSnapshot(List.of(B_ROOM), NOV_2, false)).isEqualTo(9000);

        assertThat(SlotSchedule.isFlatPricing(List.of(TABLE), NOV_2)).isTrue();
        assertThat(SlotSchedule.totalPaymentAmount(List.of(TABLE), 4, false, NOV_2)).isEqualTo(10000);
        assertThat(SlotSchedule.unitPriceSnapshot(List.of(TABLE), NOV_2, false)).isNull();
    }

    @Test
    @DisplayName("환불 — 48h 전 100%, 24h 전 50%, 그 안쪽 0%")
    void refund() {
        LocalDateTime start = LocalDateTime.of(NOV_2, LocalTime.of(13, 0));
        assertThat(ReservationRefundPolicy.refundRate(start, start.minusHours(72))).isEqualTo(100);
        assertThat(ReservationRefundPolicy.refundRate(start, start.minusHours(30))).isEqualTo(50);
        assertThat(ReservationRefundPolicy.refundRate(start, start.minusHours(1))).isEqualTo(0);
    }

    @Test
    @DisplayName("월간패스 — 이용월이 패스 기간 안인 룸 예약만 본인 1명분 할인")
    void monthlyPassDiscount() {
        LocalDate nov20 = LocalDate.of(2026, 11, 20);   // 금요일
        LocalDate nov21 = LocalDate.of(2026, 11, 21);   // 토요일

        assertThat(SlotSchedule.monthlyPassDiscount(true, List.of(B_ROOM), 4, false, nov20)).isEqualTo(9000);
        assertThat(SlotSchedule.monthlyPassDiscount(true, List.of(B_ROOM), 4, true, nov21)).isEqualTo(10000);
        // 패스 기간 밖
        assertThat(SlotSchedule.monthlyPassDiscount(false, List.of(B_ROOM), 4, false, nov20)).isZero();
        // 마작 대탁(정액)은 할인 없음
        assertThat(SlotSchedule.monthlyPassDiscount(true, List.of(TABLE), 4, false, nov20)).isZero();
        // 1명 예약은 0원 결제가 되므로 할인하지 않는다
        assertThat(SlotSchedule.monthlyPassDiscount(true, List.of(B_ROOM), 1, false, nov20)).isZero();
    }
}
