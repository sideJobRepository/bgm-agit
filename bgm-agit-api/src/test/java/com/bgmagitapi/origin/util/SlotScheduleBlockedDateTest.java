package com.bgmagitapi.origin.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 개편 오픈 전까지 10월 예약을 막아 두는 장치.
 *
 * 차단은 lastReservableDate 를 줄이는 방식이라, 조회 슬롯 생성 범위와 등록 검증이 한꺼번에 좁혀진다.
 * 이 연결이 끊기면 달력에는 안 보이는데 직접 POST 는 통과하는 상태가 되므로 값을 못 박아 둔다.
 */
class SlotScheduleBlockedDateTest {

    @Test
    @DisplayName("차단 시작일부터는 예약 가능 기간에서 잘린다")
    void blockedDatesAreCutFromWindow() {
        LocalDate blockedFrom = SlotSchedule.RESERVATION_BLOCKED_FROM;
        // 개편을 열면서 상수를 null 로 바꾸면 검증할 것이 없다
        if (blockedFrom == null) {
            return;
        }
        LocalDate today = blockedFrom.minusDays(10);

        assertThat(SlotSchedule.isBlockedDate(blockedFrom)).isTrue();
        assertThat(SlotSchedule.isBlockedDate(blockedFrom.minusDays(1))).isFalse();
        assertThat(SlotSchedule.lastReservableDate(today)).isEqualTo(blockedFrom.minusDays(1));
        assertThat(SlotSchedule.isWithinReservableWindow(blockedFrom, today)).isFalse();
        assertThat(SlotSchedule.isWithinReservableWindow(blockedFrom.minusDays(1), today)).isTrue();
    }

    @Test
    @DisplayName("차단이 없으면 3개월 창이 그대로다")
    void windowIsUntouchedWhenNothingIsBlocked() {
        LocalDate today = LocalDate.of(2026, 1, 5);
        LocalDate blockedFrom = SlotSchedule.RESERVATION_BLOCKED_FROM;
        // 차단 시작일보다 3개월 이상 앞선 날짜라면 상한이 원래대로 나와야 한다
        if (blockedFrom != null && !today.plusMonths(SlotSchedule.RESERVATION_WINDOW_MONTHS).isBefore(blockedFrom)) {
            return;
        }
        assertThat(SlotSchedule.lastReservableDate(today))
                .isEqualTo(today.plusMonths(SlotSchedule.RESERVATION_WINDOW_MONTHS));
    }
}
