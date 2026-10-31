package com.bgmagitapi.origin.util;

import com.bgmagitapi.origin.entity.BgmAgitRoom;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 벙주 혜택가와 하루 1룸 — SlotSchedule 의 순수 판정.
 * 혜택 기간·요금은 관리자 설정이라 여기서는 "기간 안인지"를 인자로 받는다.
 */
class BungjuRateTest {

    private static final LocalDate NOV_1 = LocalDate.of(2026, 11, 1);     // 일요일
    private static final LocalDate NOV_2 = LocalDate.of(2026, 11, 2);     // 월요일

    private static BgmAgitRoom room(long id, String name, String link, int min, int max) {
        BgmAgitRoom room = new BgmAgitRoom(name, link, min, max, null, null, "Y");
        ReflectionTestUtils.setField(room, "bgmAgitRoomId", id);
        return room;
    }

    private static final List<BgmAgitRoom> B_ROOM = List.of(room(1, "B Room", BgmAgitRoom.LINK_ROOM, 4, 6));
    private static final List<BgmAgitRoom> TABLE = List.of(room(5, "대탁 1", BgmAgitRoom.LINK_MAHJONG, 4, 4));

    @Test
    @DisplayName("혜택 대상 — 기간 안 + 평일 + 룸")
    void rateDate() {
        assertThat(SlotSchedule.isBungjuRateDate(true, false, B_ROOM, NOV_2)).isTrue();
        assertThat(SlotSchedule.isBungjuRateDate(true, true, B_ROOM, NOV_2)).isFalse();    // 주말·공휴일
        assertThat(SlotSchedule.isBungjuRateDate(false, false, B_ROOM, NOV_2)).isFalse();  // 기간 밖·꺼짐
        assertThat(SlotSchedule.isBungjuRateDate(true, false, TABLE, NOV_2)).isFalse();    // 마작 대탁
    }

    @Test
    @DisplayName("혜택 단가가 박힌 예약은 인원 × 혜택 단가")
    void amount() {
        assertThat(SlotSchedule.totalPaymentAmount(B_ROOM, 4, false, NOV_2, 5000)).isEqualTo(20000);
        assertThat(SlotSchedule.totalPaymentAmount(B_ROOM, 4, false, NOV_2, null)).isEqualTo(36000);
        assertThat(SlotSchedule.totalPaymentAmount(B_ROOM, 4, false, NOV_2)).isEqualTo(36000);
    }

    @Test
    @DisplayName("정액(마작 대탁)은 혜택 단가가 있어도 정액 그대로")
    void flatIgnoresRate() {
        assertThat(SlotSchedule.totalPaymentAmount(TABLE, 4, false, NOV_2, 5000))
                .isEqualTo(SlotSchedule.MAHJONG_DEPOSIT_AMOUNT);
        assertThat(SlotSchedule.unitPriceSnapshot(TABLE, NOV_2, false, 5000)).isNull();
    }

    @Test
    @DisplayName("결제 단가 스냅샷은 혜택 단가 — 인원 축소 환불이 그 기준이 된다")
    void snapshot() {
        assertThat(SlotSchedule.unitPriceSnapshot(B_ROOM, NOV_2, false, 5000)).isEqualTo(5000);
        assertThat(SlotSchedule.unitPriceSnapshot(B_ROOM, NOV_2, false, null)).isEqualTo(9000);
    }

    @Test
    @DisplayName("룸 이용 안내는 11/2 이용분부터 룸만, 하루 1룸 제한은 꺼져 있다")
    void oneRoomPerDay() {
        assertThat(SlotSchedule.isRoomUseNoticeDay(B_ROOM, NOV_1)).isFalse();
        assertThat(SlotSchedule.isRoomUseNoticeDay(B_ROOM, NOV_2)).isTrue();
        assertThat(SlotSchedule.isRoomUseNoticeDay(TABLE, NOV_2)).isFalse();
        assertThat(SlotSchedule.isOneRoomPerDay(B_ROOM, NOV_2)).isEqualTo(SlotSchedule.ONE_ROOM_PER_DAY_ENABLED);
    }
}
