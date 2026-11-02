package com.bgmagitapi.origin.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Function;

import static org.assertj.core.api.Assertions.assertThat;

class ReservationChangePolicyTest {

    private static final LocalDateTime START = LocalDateTime.of(2026, 11, 10, 14, 0);

    @Test
    @DisplayName("손님 변경 마감은 이용 시작 24시간 전이고 그 시각 정각까지 허용한다")
    void customerDeadline() {
        assertThat(ReservationChangePolicy.customerDeadline(START)).isEqualTo(START.minusHours(24));
        assertThat(ReservationChangePolicy.formatDeadline(START)).isEqualTo("2026-11-09 14:00");

        assertThat(ReservationChangePolicy.blockReason(false, false, false, START, START.minusHours(24))).isNull();
        assertThat(ReservationChangePolicy.blockReason(false, false, false, START, START.minusHours(24).plusMinutes(1)))
                .contains("24시간 전");
    }

    @Test
    @DisplayName("마감 안쪽이면 손님 감소 환불은 늘 100% 또는 50% 다")
    void refundRateBeforeDeadline() {
        LocalDateTime atDeadline = START.minusHours(24);
        assertThat(ReservationRefundPolicy.refundRate(START, atDeadline)).isEqualTo(50);
        assertThat(ReservationRefundPolicy.refundRate(START, START.minusHours(48))).isEqualTo(100);
    }

    @Test
    @DisplayName("관리자는 마감 뒤에도 시작 전까지 바꿀 수 있다")
    void adminUntilStart() {
        assertThat(ReservationChangePolicy.blockReason(false, false, true, START, START.minusMinutes(1))).isNull();
        assertThat(ReservationChangePolicy.blockReason(false, false, true, START, START)).contains("이미 시작");
    }

    @Test
    @DisplayName("취소된 예약·마작 대탁(손님)은 변경 불가, 마작 대탁 관리자는 가능")
    void canceledAndFlat() {
        LocalDateTime now = START.minusDays(5);
        assertThat(ReservationChangePolicy.blockReason(true, false, true, START, now)).contains("취소");
        assertThat(ReservationChangePolicy.blockReason(false, true, false, START, now)).contains("마작");
        assertThat(ReservationChangePolicy.blockReason(false, true, true, START, now)).isNull();
        assertThat(ReservationChangePolicy.blockReason(false, false, false, null, now)).isNotNull();
    }

    @Test
    @DisplayName("룸 후보는 단독 전부 + M-1/M-2/M-3 의 2·3개 조합")
    void combinableSets() {
        List<String> rooms = List.of("B Room", "G Room", "M-1", "M-2", "M-3");
        List<List<String>> sets = SlotSchedule.combinableSets(rooms, Function.identity());

        assertThat(sets).hasSize(5 + 3 + 1);
        assertThat(sets.subList(0, 5)).containsExactly(
                List.of("B Room"), List.of("G Room"), List.of("M-1"), List.of("M-2"), List.of("M-3"));
        assertThat(sets).contains(
                List.of("M-1", "M-2"), List.of("M-1", "M-3"), List.of("M-2", "M-3"), List.of("M-1", "M-2", "M-3"));
        assertThat(sets).doesNotContain(List.of("B Room", "G Room"));
    }

    @Test
    @DisplayName("조합 그룹 방이 하나뿐이면 조합 후보가 없다")
    void noCombinationWithSingleMember() {
        assertThat(SlotSchedule.combinableSets(List.of("B Room", "M-1"), Function.identity()))
                .containsExactly(List.of("B Room"), List.of("M-1"));
        assertThat(SlotSchedule.combinableSets(List.<String>of(), Function.identity())).isEmpty();
    }
}
