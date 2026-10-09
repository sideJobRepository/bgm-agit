package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.util.SlotSchedule;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 예약 등록의 시간 검증(연속 구간). DB 없이 도는 순수 검증이다.
 * 프론트도 떨어진 칸을 막지만 직접 POST 를 막는 건 서버다.
 */
class ReservationSlotValidationTest {

    private static final LocalDate MON = LocalDate.of(2026, 10, 5);

    private static List<LocalTime> hours(int from, int count) {
        List<LocalTime> result = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            result.add(LocalTime.of((from + i) % 24, 0));
        }
        return result;
    }

    @Test
    @DisplayName("떨어진 시간대는 400")
    void rejectsGaps() {
        SlotSchedule room = SlotSchedule.of(false, MON);
        assertThatThrownBy(() -> BgmAgitReservationServiceImpl.validateSelectedSlots(
                room, List.of(LocalTime.of(13, 0), LocalTime.of(15, 0))))
                .isInstanceOf(ValidException.class)
                .hasMessage(BgmAgitReservationServiceImpl.NOT_CONTIGUOUS_MESSAGE);
    }

    @Test
    @DisplayName("룸은 이어져 있으면 길이 제한 없이 통과 — 자정을 넘겨도 같다(8시간 상한 철회)")
    void roomHasNoCap() {
        SlotSchedule room = SlotSchedule.of(false, MON);
        assertThatCode(() -> BgmAgitReservationServiceImpl.validateSelectedSlots(room, hours(13, 12)))
                .doesNotThrowAnyException();
        assertThatCode(() -> BgmAgitReservationServiceImpl.validateSelectedSlots(room, hours(20, 8)))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("마작 대탁(3시간 슬롯)은 연속이면 전부 선택 가능, 떨어지면 400")
    void mahjongContiguous() {
        SlotSchedule mahjong = SlotSchedule.of(true, MON);
        assertThatCode(() -> BgmAgitReservationServiceImpl.validateSelectedSlots(mahjong,
                List.of(LocalTime.of(14, 0), LocalTime.of(17, 0), LocalTime.of(20, 0), LocalTime.of(23, 0))))
                .doesNotThrowAnyException();
        assertThatThrownBy(() -> BgmAgitReservationServiceImpl.validateSelectedSlots(mahjong,
                List.of(LocalTime.of(14, 0), LocalTime.of(20, 0))))
                .isInstanceOf(ValidException.class);
    }
}
