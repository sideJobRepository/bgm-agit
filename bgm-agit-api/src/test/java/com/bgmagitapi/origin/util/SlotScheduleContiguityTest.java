package com.bgmagitapi.origin.util;

import com.bgmagitapi.origin.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.origin.controller.response.reservation.TimeRange;
import com.bgmagitapi.origin.entity.BgmAgitRoom;
import com.bgmagitapi.origin.entity.enumeration.Reservation;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 예약 1건 = 이어진 한 구간 정규화의 순수 함수들.
 * 떨어진 시간대 차단(isContiguous)과 방별 구간 겹침(toPeriod/overlaps)이 자정을 넘겨도 맞는지 고정한다.
 */
class SlotScheduleContiguityTest {

    private static final LocalDate DAY = LocalDate.of(2026, 10, 20); // 화요일

    private static final BgmAgitRoom ROOM = new BgmAgitRoom("C Room", BgmAgitRoom.LINK_ROOM, 2, 4, null, null, "Y");
    private static final BgmAgitRoom G_ROOM = new BgmAgitRoom("G Room", BgmAgitRoom.LINK_ROOM, 7, 12, null, null, "Y");
    private static final BgmAgitRoom MAHJONG = new BgmAgitRoom("대탁", BgmAgitRoom.LINK_MAHJONG, 4, 4, null, null, "Y");

    private static List<SlotSchedule.Slot> pick(BgmAgitRoom room, String... starts) {
        return SlotSchedule.of(room, DAY).resolveSlots(
                java.util.Arrays.stream(starts).map(LocalTime::parse).toList());
    }

    private static LocalDateTime at(LocalDate date, int hour) {
        return LocalDateTime.of(date, LocalTime.of(hour, 0));
    }

    @Test
    @DisplayName("붙어 있는 1시간 슬롯은 순서와 무관하게 연속이다")
    void adjacentRoomSlotsAreContiguous() {
        assertThat(SlotSchedule.isContiguous(pick(ROOM, "15:00", "13:00", "14:00"))).isTrue();
    }

    @Test
    @DisplayName("사이가 빈 슬롯은 연속이 아니다")
    void gapIsNotContiguous() {
        assertThat(SlotSchedule.isContiguous(pick(ROOM, "13:00", "15:00"))).isFalse();
    }

    @Test
    @DisplayName("자정을 넘기는 슬롯도 이어지면 연속이다 (23:00, 00:00, 01:00)")
    void contiguousAcrossMidnight() {
        List<SlotSchedule.Slot> slots = pick(ROOM, "01:00", "23:00", "00:00");
        assertThat(SlotSchedule.isContiguous(slots)).isTrue();
        assertThat(slots.get(0).start()).isEqualTo(at(DAY, 23));
        assertThat(slots.get(slots.size() - 1).end()).isEqualTo(at(DAY.plusDays(1), 2));
    }

    @Test
    @DisplayName("마작 대여 3시간 슬롯 20:00 + 23:00 은 연속, 14:00 + 20:00 은 아니다")
    void mahjongSlots() {
        assertThat(SlotSchedule.isContiguous(pick(MAHJONG, "20:00", "23:00"))).isTrue();
        assertThat(SlotSchedule.isContiguous(pick(MAHJONG, "14:00", "20:00"))).isFalse();
    }

    @Test
    @DisplayName("G룸 두 슬롯(13~18, 19~00)은 1시간이 비어 연속이 아니다")
    void gRoomTwoSlotsAreNotContiguous() {
        assertThat(SlotSchedule.isContiguous(pick(G_ROOM, "13:00", "19:00"))).isFalse();
    }

    @Test
    @DisplayName("후보에 없는 시각이 섞이면 슬롯으로 복원하지 않는다")
    void unknownStartIsRejected() {
        assertThat(pick(ROOM, "13:30")).isEmpty();
        assertThat(pick(MAHJONG, "15:00")).isEmpty();
        assertThat(SlotSchedule.isContiguous(List.of())).isFalse();
    }

    @Test
    @DisplayName("예약 구간 해석: 종료가 시작 이하이면 다음 날, 06시 이전 시작은 익일 새벽")
    void toPeriodHandlesMidnight() {
        SlotSchedule.Slot lateNight = SlotSchedule.toPeriod(DAY, LocalTime.of(23, 0), LocalTime.of(2, 0));
        assertThat(lateNight.start()).isEqualTo(at(DAY, 23));
        assertThat(lateNight.end()).isEqualTo(at(DAY.plusDays(1), 2));

        SlotSchedule.Slot gRoomEvening = SlotSchedule.toPeriod(DAY, LocalTime.of(19, 0), LocalTime.MIDNIGHT);
        assertThat(gRoomEvening.end()).isEqualTo(at(DAY.plusDays(1), 0));

        SlotSchedule.Slot earlyMorning = SlotSchedule.toPeriod(DAY, LocalTime.of(1, 0), LocalTime.of(2, 0));
        assertThat(earlyMorning.start()).isEqualTo(at(DAY.plusDays(1), 1));
        assertThat(earlyMorning.end()).isEqualTo(at(DAY.plusDays(1), 2));
    }

    @Test
    @DisplayName("구간 겹침: 일부만 겹쳐도 겹침, 끝과 시작이 맞닿으면 겹침 아님")
    void overlaps() {
        SlotSchedule.Slot a = SlotSchedule.toPeriod(DAY, LocalTime.of(13, 0), LocalTime.of(16, 0));
        SlotSchedule.Slot partial = SlotSchedule.toPeriod(DAY, LocalTime.of(15, 0), LocalTime.of(17, 0));
        SlotSchedule.Slot touching = SlotSchedule.toPeriod(DAY, LocalTime.of(16, 0), LocalTime.of(18, 0));
        assertThat(SlotSchedule.overlaps(a, partial)).isTrue();
        assertThat(SlotSchedule.overlaps(a, touching)).isFalse();
    }

    @Test
    @DisplayName("구간 겹침(자정 넘김): 마작 23~02 와 00~01 은 겹치고, 다음 영업일 13시와는 안 겹친다")
    void overlapsAcrossMidnight() {
        SlotSchedule.Slot mahjongLate = SlotSchedule.toPeriod(DAY, LocalTime.of(23, 0), LocalTime.of(2, 0));
        SlotSchedule.Slot afterMidnight = SlotSchedule.toPeriod(DAY, LocalTime.of(0, 0), LocalTime.of(1, 0));
        SlotSchedule.Slot nextDayAfternoon = SlotSchedule.toPeriod(DAY.plusDays(1), LocalTime.of(13, 0), LocalTime.of(14, 0));
        SlotSchedule.Slot sameDayAfternoon = SlotSchedule.toPeriod(DAY, LocalTime.of(13, 0), LocalTime.of(14, 0));

        assertThat(SlotSchedule.overlaps(mahjongLate, afterMidnight)).isTrue();
        assertThat(SlotSchedule.overlaps(mahjongLate, nextDayAfternoon)).isFalse();
        assertThat(SlotSchedule.overlaps(afterMidnight, sameDayAfternoon)).isFalse();
    }

    @Test
    @DisplayName("슬롯 점유: 확정건은 막고, 남의 대기건은 안 막고, 내 대기건은 막는다(구간을 슬롯으로 펼침)")
    void timeRangeOccupancy() {
        Map<LocalDate, List<TimeRange>> map = ReservedTimeDto.groupedReservation(List.of(
                new ReservedTimeDto(DAY, LocalTime.of(23, 0), LocalTime.of(2, 0), "Y", 10L, "N"),
                new ReservedTimeDto(DAY, LocalTime.of(13, 0), LocalTime.of(15, 0), "N", 20L, "N"),
                new ReservedTimeDto(DAY, LocalTime.of(16, 0), LocalTime.of(17, 0), "Y", 30L, "Y")
        ));
        List<TimeRange> ranges = map.get(DAY);
        assertThat(ranges).hasSize(3);

        // 확정 23~02 는 01:00~02:00 슬롯(익일)을 막는다
        LocalDateTime oneAm = at(DAY.plusDays(1), 1);
        assertThat(ranges.stream().anyMatch(r -> r.isOverlapping(oneAm, oneAm.plusHours(1), null))).isTrue();

        // 대기 13~15 는 14:00 슬롯을 본인(20)에게만 막는다
        LocalDateTime twoPm = at(DAY, 14);
        assertThat(ranges.stream().anyMatch(r -> r.isOverlapping(twoPm, twoPm.plusHours(1), 99L))).isFalse();
        assertThat(ranges.stream().anyMatch(r -> r.isOverlapping(twoPm, twoPm.plusHours(1), 20L))).isTrue();

        // 취소건은 막지 않는다
        LocalDateTime fourPm = at(DAY, 16);
        assertThat(ranges.stream().anyMatch(r -> r.isOverlapping(fourPm, fourPm.plusHours(1), 30L))).isFalse();
    }

    @Test
    @DisplayName("룸/마작·G룸 판정과 예약금 합산은 방 링크·이름 기준")
    void policyByRoom() {
        assertThat(SlotSchedule.resolveReservationType(MAHJONG)).isEqualTo(Reservation.DELEGATE_PLAY);
        assertThat(SlotSchedule.resolveReservationType(ROOM)).isEqualTo(Reservation.ROOM);
        assertThat(SlotSchedule.maxSelectableSlots(G_ROOM)).isEqualTo(1);
        assertThat(SlotSchedule.maxSelectableSlots(ROOM)).isNull();
        assertThat(SlotSchedule.of(G_ROOM, DAY).slots()).hasSize(2);
        assertThat(SlotSchedule.of(MAHJONG, DAY).slots()).hasSize(4);
        assertThat(SlotSchedule.of(ROOM, DAY).slots()).hasSize(13);
    }

    @Test
    @DisplayName("영업일 정렬 분값: 06시 이전은 +1440")
    void sortableMinutes() {
        assertThat(SlotSchedule.toSortableMinutes(LocalTime.of(23, 0))).isEqualTo(23 * 60);
        assertThat(SlotSchedule.toSortableMinutes(LocalTime.MIDNIGHT)).isEqualTo(24 * 60);
        assertThat(SlotSchedule.toSortableMinutes(LocalTime.of(2, 0))).isEqualTo(26 * 60);
    }
}
