package com.bgmagitapi.origin.util;

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

    @Test
    @DisplayName("룸 슬롯은 10시부터 24개이고 마지막이 09:00~10:00 이다")
    void roomSlotsCoverFullDay() {
        List<SlotSchedule.Slot> slots = SlotSchedule.of(false, MON).slots();

        assertThat(slots).hasSize(24);
        assertThat(slots.get(0).start()).isEqualTo(LocalDateTime.of(MON, LocalTime.of(10, 0)));
        assertThat(slots.get(23).start()).isEqualTo(LocalDateTime.of(MON.plusDays(1), LocalTime.of(9, 0)));
        assertThat(slots.get(23).end()).isEqualTo(LocalDateTime.of(MON.plusDays(1), LocalTime.of(10, 0)));
    }

    @Test
    @DisplayName("G룸도 다른 룸과 같은 24슬롯이고, 선택 슬롯 수 제한은 없다(8시간 상한 철회)")
    void gRoomIsNoLongerSpecial() {
        assertThat(SlotSchedule.of(false, MON).slots()).hasSize(24);
        assertThat(SlotSchedule.maxSelectableSlots(false)).isNull();
        assertThat(SlotSchedule.maxSelectableSlots(true)).isNull();
    }

    @Test
    @DisplayName("마작 대탁은 개편 대상이 아니라 3시간 슬롯 4개 그대로다")
    void mahjongRentalUnchanged() {
        List<SlotSchedule.Slot> slots = SlotSchedule.of(true, MON).slots();

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
    @DisplayName("주말 단가 여부는 인자로 받는다 — 토·일인지 공휴일인지는 SlotSchedule 이 모른다")
    void unitPriceTakesWeekendFlag() {
        assertThat(SlotSchedule.unitPrice(false)).isEqualTo(9000);
        assertThat(SlotSchedule.unitPrice(true)).isEqualTo(11000);
    }

    @Test
    @DisplayName("연속 구간만 예약할 수 있다")
    void contiguousSelectionOnly() {
        SlotSchedule schedule = SlotSchedule.of(false, MON);

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

    @Test
    @DisplayName("선택 슬롯은 영업일 순서로 정렬해 첫 시작 ~ 마지막 끝 한 구간이 된다")
    void spanCoversSelection() {
        SlotSchedule room = SlotSchedule.of(false, MON);
        SlotSchedule.Slot span = room.span(List.of(LocalTime.of(0, 0), LocalTime.of(23, 0), LocalTime.of(22, 0)));
        assertThat(span.start()).isEqualTo(LocalDateTime.of(MON, LocalTime.of(22, 0)));
        assertThat(span.end()).isEqualTo(LocalDateTime.of(MON.plusDays(1), LocalTime.of(1, 0)));

        SlotSchedule mahjong = SlotSchedule.of(true, MON);
        SlotSchedule.Slot last = mahjong.span(List.of(LocalTime.of(23, 0)));
        assertThat(last.start()).isEqualTo(LocalDateTime.of(MON, LocalTime.of(23, 0)));
        assertThat(last.end()).isEqualTo(LocalDateTime.of(MON.plusDays(1), LocalTime.of(2, 0)));

        // 후보에 없는 시각이 섞이면 구간을 만들지 않는다
        assertThat(mahjong.span(List.of(LocalTime.of(15, 0)))).isNull();
    }

    @Test
    @DisplayName("저장된 시작·종료 시각은 자정·하루 경계를 넘겨 실제 구간으로 환산된다")
    void useRangeCrossesMidnightAndBoundary() {
        // 마작 23:00~02:00 → 당일 23시 ~ 익일 02시
        SlotSchedule.Slot mahjong = SlotSchedule.useRange(MON, LocalTime.of(23, 0), LocalTime.of(2, 0));
        assertThat(mahjong.start()).isEqualTo(LocalDateTime.of(MON, LocalTime.of(23, 0)));
        assertThat(mahjong.end()).isEqualTo(LocalDateTime.of(MON.plusDays(1), LocalTime.of(2, 0)));

        // 룸 마지막 두 칸 08:00~10:00 → 둘 다 익일
        SlotSchedule.Slot tail = SlotSchedule.useRange(MON, LocalTime.of(8, 0), LocalTime.of(10, 0));
        assertThat(tail.start()).isEqualTo(LocalDateTime.of(MON.plusDays(1), LocalTime.of(8, 0)));
        assertThat(tail.end()).isEqualTo(LocalDateTime.of(MON.plusDays(1), LocalTime.of(10, 0)));

        // 시작 = 종료(10:00~10:00)는 하루 전체
        SlotSchedule.Slot fullDay = SlotSchedule.useRange(MON, LocalTime.of(10, 0), LocalTime.of(10, 0));
        assertThat(fullDay.start()).isEqualTo(LocalDateTime.of(MON, LocalTime.of(10, 0)));
        assertThat(fullDay.end()).isEqualTo(LocalDateTime.of(MON.plusDays(1), LocalTime.of(10, 0)));
    }

    @Test
    @DisplayName("구간 겹침 — 일부만 겹쳐도 충돌, 맞닿기만 하면 충돌 아님, 자정 넘김도 비교된다")
    void overlapping() {
        SlotSchedule.Slot a = SlotSchedule.useRange(MON, LocalTime.of(13, 0), LocalTime.of(17, 0));
        SlotSchedule.Slot partial = SlotSchedule.useRange(MON, LocalTime.of(15, 0), LocalTime.of(18, 0));
        SlotSchedule.Slot touching = SlotSchedule.useRange(MON, LocalTime.of(17, 0), LocalTime.of(19, 0));
        assertThat(SlotSchedule.isOverlapping(a.start(), a.end(), partial.start(), partial.end())).isTrue();
        assertThat(SlotSchedule.isOverlapping(a.start(), a.end(), touching.start(), touching.end())).isFalse();

        SlotSchedule.Slot lateMahjong = SlotSchedule.useRange(MON, LocalTime.of(23, 0), LocalTime.of(2, 0));
        SlotSchedule.Slot afterMidnight = SlotSchedule.useRange(MON, LocalTime.of(1, 0), LocalTime.of(3, 0));
        assertThat(SlotSchedule.isOverlapping(lateMahjong.start(), lateMahjong.end(),
                afterMidnight.start(), afterMidnight.end())).isTrue();
    }
}
