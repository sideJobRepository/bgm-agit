package com.bgmagitapi.origin.util;

import com.bgmagitapi.origin.entity.enumeration.BgmAgitImageCategory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 10월 개편으로 하루 경계가 10시가 되고 룸 슬롯이 24개가 됐다.
 * 경계 계산이 틀리면 환불 비율·현황판·알림톡이 한꺼번에 어긋나므로 값을 못 박아 둔다.
 */
class SlotScheduleTest {

    private static final LocalDate MON = LocalDate.of(2026, 10, 5);  // 월요일
    private static final LocalDate SAT = LocalDate.of(2026, 10, 3);  // 토요일
    private static final LocalDate SUN = LocalDate.of(2026, 10, 4);  // 일요일

    @Test
    @DisplayName("룸 슬롯은 10시부터 24개이고 마지막이 09:00~10:00 이다")
    void roomSlotsCoverFullDay() {
        List<SlotSchedule.Slot> slots = SlotSchedule.of(BgmAgitImageCategory.ROOM, "B Room", MON).slots();

        assertThat(slots).hasSize(24);
        assertThat(slots.get(0).start()).isEqualTo(LocalDateTime.of(MON, LocalTime.of(10, 0)));
        assertThat(slots.get(23).start()).isEqualTo(LocalDateTime.of(MON.plusDays(1), LocalTime.of(9, 0)));
        assertThat(slots.get(23).end()).isEqualTo(LocalDateTime.of(MON.plusDays(1), LocalTime.of(10, 0)));
    }

    @Test
    @DisplayName("G룸도 다른 룸과 같은 24슬롯이다(하루 1팀 제한 폐지)")
    void gRoomIsNoLongerSpecial() {
        assertThat(SlotSchedule.of(BgmAgitImageCategory.ROOM, "G Room", MON).slots()).hasSize(24);
        assertThat(SlotSchedule.maxSelectableSlots(BgmAgitImageCategory.ROOM, "G Room")).isNull();
    }

    @Test
    @DisplayName("마작 대탁은 개편 대상이 아니라 3시간 슬롯 4개 그대로다")
    void mahjongRentalUnchanged() {
        List<SlotSchedule.Slot> slots = SlotSchedule.of(BgmAgitImageCategory.MAHJONG, "AMOS-Rex3 - 1", MON).slots();

        assertThat(slots).hasSize(4);
        assertThat(slots.get(0).start()).isEqualTo(LocalDateTime.of(MON, LocalTime.of(14, 0)));
        assertThat(slots.get(3).end()).isEqualTo(LocalDateTime.of(MON.plusDays(1), LocalTime.of(2, 0)));
    }

    @Test
    @DisplayName("경계(10시) 이전 시각은 익일로 환산된다")
    void slotDateTimeCrossesBoundary() {
        assertThat(SlotSchedule.slotDateTime(MON, LocalTime.of(23, 0)))
                .isEqualTo(LocalDateTime.of(MON, LocalTime.of(23, 0)));
        assertThat(SlotSchedule.slotDateTime(MON, LocalTime.of(9, 0)))
                .isEqualTo(LocalDateTime.of(MON.plusDays(1), LocalTime.of(9, 0)));
        // 경계값 자체(10:00)는 당일이다
        assertThat(SlotSchedule.slotDateTime(MON, LocalTime.of(10, 0)))
                .isEqualTo(LocalDateTime.of(MON, LocalTime.of(10, 0)));
    }

    @Test
    @DisplayName("정렬용 분값은 경계 이전이면 +1440 된다")
    void sortableMinutesPushesEarlyHoursToTheEnd() {
        assertThat(SlotSchedule.toSortableMinutes(LocalTime.of(10, 0))).isEqualTo(600);
        assertThat(SlotSchedule.toSortableMinutes(LocalTime.of(23, 0))).isEqualTo(1380);
        assertThat(SlotSchedule.toSortableMinutes(LocalTime.of(2, 0))).isEqualTo(120 + 1440);
        // 예전 경계(06시)였다면 09시는 밀리지 않았다. 10시 경계에서는 밀려야 한다
        assertThat(SlotSchedule.toSortableMinutes(LocalTime.of(9, 0))).isEqualTo(540 + 1440);
    }

    @Test
    @DisplayName("주말 단가는 토·일만 11,000원이고 공휴일은 평일가다")
    void weekendRateIsSaturdayAndSundayOnly() {
        assertThat(SlotSchedule.unitPrice(MON)).isEqualTo(9000);
        assertThat(SlotSchedule.unitPrice(SAT)).isEqualTo(11000);
        assertThat(SlotSchedule.unitPrice(SUN)).isEqualTo(11000);

        // 2026-10-09 한글날(금) — 공휴일이지만 평일 단가
        assertThat(SlotSchedule.unitPrice(LocalDate.of(2026, 10, 9))).isEqualTo(9000);
    }

    @Test
    @DisplayName("연속 구간만 예약할 수 있다")
    void contiguousSelectionOnly() {
        SlotSchedule schedule = SlotSchedule.of(BgmAgitImageCategory.ROOM, "B Room", MON);

        assertThat(schedule.isContiguous(List.of(LocalTime.of(13, 0), LocalTime.of(14, 0), LocalTime.of(15, 0)))).isTrue();
        // 자정을 넘겨도 슬롯 순서상 이어져 있으면 연속이다
        assertThat(schedule.isContiguous(List.of(LocalTime.of(23, 0), LocalTime.of(0, 0)))).isTrue();
        assertThat(schedule.isContiguous(List.of(LocalTime.of(13, 0), LocalTime.of(20, 0)))).isFalse();
        assertThat(schedule.isContiguous(List.of())).isFalse();
    }

    @Test
    @DisplayName("합쳐 예약은 M-1/M-2/M-3 조합만 허용된다")
    void combinableWhitelist() {
        assertThat(SlotSchedule.isCombinable(List.of("M-1", "M-2"))).isTrue();
        assertThat(SlotSchedule.isCombinable(List.of("M-1", "M-2", "M-3"))).isTrue();
        assertThat(SlotSchedule.isCombinable(List.of("G Room"))).isTrue();
        // 슬롯 제한이 사라지면서 예전 방어(maxSelectableSlots != null)가 무력해진 조합
        assertThat(SlotSchedule.isCombinable(List.of("B Room", "G Room"))).isFalse();
        assertThat(SlotSchedule.isCombinable(List.of("M-1", "B Room"))).isFalse();
    }
}
