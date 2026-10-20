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
 * 11월 개편은 이용일 기준이다(SlotSchedule.NEW_POLICY_FROM). 10월 이용분은 종전 정책,
 * 11/1 이용분부터 새 정책이 걸리는지 경계 양쪽을 못 박아 둔다. 월간패스 할인 조건도 여기서 본다.
 */
class PolicySwitchTest {

    private static final LocalDate OCT_31 = LocalDate.of(2026, 10, 31);   // 토요일
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
    @DisplayName("정책 시행일 경계 — 10/31 은 종전, 11/1 부터 새 정책")
    void boundary() {
        assertThat(SlotSchedule.isNewPolicy(OCT_31)).isFalse();
        assertThat(SlotSchedule.isNewPolicy(NOV_1)).isTrue();
    }

    @Test
    @DisplayName("10월 일반 룸은 13시~익일 02시 1시간 13칸, 11월은 10시부터 24칸")
    void roomSlotsByDate() {
        List<SlotSchedule.Slot> oct = SlotSchedule.of(B_ROOM, OCT_31).slots();
        assertThat(oct).hasSize(13);
        assertThat(oct.get(0).start()).isEqualTo(LocalDateTime.of(OCT_31, LocalTime.of(13, 0)));
        assertThat(oct.get(12).end()).isEqualTo(LocalDateTime.of(NOV_1, LocalTime.of(2, 0)));

        List<SlotSchedule.Slot> nov = SlotSchedule.of(B_ROOM, NOV_1).slots();
        assertThat(nov).hasSize(24);
        assertThat(nov.get(0).start()).isEqualTo(LocalDateTime.of(NOV_1, LocalTime.of(10, 0)));
    }

    @Test
    @DisplayName("10월 G룸은 13~18, 19~24 두 칸·하나만 선택, 11월은 다른 룸과 같다")
    void gRoomByDate() {
        List<SlotSchedule.Slot> oct = SlotSchedule.of(G_ROOM, OCT_31).slots();
        assertThat(oct).hasSize(2);
        assertThat(oct.get(0).end()).isEqualTo(LocalDateTime.of(OCT_31, LocalTime.of(18, 0)));
        assertThat(oct.get(1).start()).isEqualTo(LocalDateTime.of(OCT_31, LocalTime.of(19, 0)));
        assertThat(oct.get(1).end()).isEqualTo(LocalDateTime.of(NOV_1, LocalTime.of(0, 0)));
        assertThat(SlotSchedule.maxSelectableSlots(G_ROOM, OCT_31)).isEqualTo(1);
        assertThat(SlotSchedule.maxSelectableSlots(B_ROOM, OCT_31)).isNull();

        assertThat(SlotSchedule.of(G_ROOM, NOV_1).slots()).hasSize(24);
        assertThat(SlotSchedule.maxSelectableSlots(G_ROOM, NOV_1)).isNull();
    }

    @Test
    @DisplayName("마작 대탁은 날짜와 무관하게 3시간 4칸")
    void mahjongUnchanged() {
        assertThat(SlotSchedule.of(TABLE, OCT_31).slots()).hasSize(4);
        assertThat(SlotSchedule.of(TABLE, NOV_1).slots()).hasSize(4);
    }

    @Test
    @DisplayName("10월 룸은 인원과 무관하게 항목당 예약금 1만원, 11월은 인원 × 단가")
    void amountByDate() {
        assertThat(SlotSchedule.isFlatPricing(List.of(B_ROOM), OCT_31)).isTrue();
        assertThat(SlotSchedule.totalPaymentAmount(List.of(B_ROOM), 5, true, OCT_31)).isEqualTo(10000);
        // 10월 합쳐 예약은 항목 수만큼(종전 규칙)
        assertThat(SlotSchedule.totalPaymentAmount(List.of(M1, M2), 9, false, OCT_31)).isEqualTo(20000);
        assertThat(SlotSchedule.unitPriceSnapshot(List.of(B_ROOM), OCT_31, false)).isNull();

        assertThat(SlotSchedule.isFlatPricing(List.of(B_ROOM), NOV_1)).isFalse();
        assertThat(SlotSchedule.totalPaymentAmount(List.of(B_ROOM), 5, true, NOV_1)).isEqualTo(50000);
        assertThat(SlotSchedule.totalPaymentAmount(List.of(B_ROOM), 5, false, NOV_2)).isEqualTo(45000);
        // 11월 합쳐 예약은 인원 기준 1회
        assertThat(SlotSchedule.totalPaymentAmount(List.of(M1, M2), 9, false, NOV_2)).isEqualTo(81000);
        assertThat(SlotSchedule.unitPriceSnapshot(List.of(B_ROOM), NOV_2, false)).isEqualTo(9000);

        // 마작은 늘 정액
        assertThat(SlotSchedule.totalPaymentAmount(List.of(TABLE), 4, false, NOV_2)).isEqualTo(10000);
        assertThat(SlotSchedule.unitPriceSnapshot(List.of(TABLE), NOV_2, false)).isNull();
    }

    @Test
    @DisplayName("환불 — 10월 이용분은 시각과 무관하게 전액, 11월은 48h/24h")
    void refundByDate() {
        LocalDateTime octStart = LocalDateTime.of(OCT_31, LocalTime.of(13, 0));
        assertThat(ReservationRefundPolicy.refundRate(OCT_31, octStart, octStart.minusHours(1))).isEqualTo(100);

        LocalDateTime novStart = LocalDateTime.of(NOV_2, LocalTime.of(13, 0));
        assertThat(ReservationRefundPolicy.refundRate(NOV_2, novStart, novStart.minusHours(72))).isEqualTo(100);
        assertThat(ReservationRefundPolicy.refundRate(NOV_2, novStart, novStart.minusHours(30))).isEqualTo(50);
        assertThat(ReservationRefundPolicy.refundRate(NOV_2, novStart, novStart.minusHours(1))).isEqualTo(0);
    }

    @Test
    @DisplayName("월간패스 — 이번 달 이용분 룸 예약만 본인 1명분 할인")
    void monthlyPassDiscount() {
        LocalDate todayInNov = LocalDate.of(2026, 11, 10);
        LocalDate nov20 = LocalDate.of(2026, 11, 20);   // 금요일
        LocalDate nov21 = LocalDate.of(2026, 11, 21);   // 토요일

        assertThat(SlotSchedule.monthlyPassDiscount(true, List.of(B_ROOM), 4, false, nov20, todayInNov)).isEqualTo(9000);
        assertThat(SlotSchedule.monthlyPassDiscount(true, List.of(B_ROOM), 4, true, nov21, todayInNov)).isEqualTo(10000);
        // 패스 아님
        assertThat(SlotSchedule.monthlyPassDiscount(false, List.of(B_ROOM), 4, false, nov20, todayInNov)).isZero();
        // 다음 달 이용분 — 이번 달 패스로는 할인하지 않는다
        assertThat(SlotSchedule.monthlyPassDiscount(true, List.of(B_ROOM), 4, false,
                LocalDate.of(2026, 12, 3), todayInNov)).isZero();
        // 10월에 결제하는 11월 이용분도 마찬가지
        assertThat(SlotSchedule.monthlyPassDiscount(true, List.of(B_ROOM), 4, false,
                nov20, LocalDate.of(2026, 10, 25))).isZero();
        // 마작 대탁·10월 이용분(정액)은 할인 없음
        assertThat(SlotSchedule.monthlyPassDiscount(true, List.of(TABLE), 4, false, nov20, todayInNov)).isZero();
        assertThat(SlotSchedule.monthlyPassDiscount(true, List.of(B_ROOM), 4, false,
                OCT_31, LocalDate.of(2026, 10, 25))).isZero();
        // 1명 예약은 0원 결제가 되므로 할인하지 않는다
        assertThat(SlotSchedule.monthlyPassDiscount(true, List.of(B_ROOM), 1, false, nov20, todayInNov)).isZero();
    }
}
