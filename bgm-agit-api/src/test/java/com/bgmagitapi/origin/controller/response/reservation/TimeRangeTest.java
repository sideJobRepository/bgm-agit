package com.bgmagitapi.origin.controller.response.reservation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 점유 판정 규칙: 취소 아닌 확정건, 또는 본인 대기건만 슬롯을 막는다. 구간은 일부만 겹쳐도 점유다.
 */
class TimeRangeTest {

    private static final LocalDate MON = LocalDate.of(2026, 10, 5);
    private static final Long ME = 1L;
    private static final Long OTHER = 2L;

    private static ReservedTimeDto dto(Long memberId, String approval, String cancel, int start, int end) {
        // 위치 기반 프로젝션과 같은 순서: roomId, reservationId, date, start, end, approval, memberId, cancel
        return new ReservedTimeDto(10L, 100L, MON, LocalTime.of(start, 0), LocalTime.of(end, 0), approval, memberId, cancel);
    }

    private static boolean occupies(ReservedTimeDto dto, int slotHour, Long viewer) {
        LocalDateTime slotStart = LocalDateTime.of(MON, LocalTime.of(slotHour, 0));
        return dto.toTimeRange().isOverlapping(slotStart, slotStart.plusHours(1), viewer);
    }

    @Test
    @DisplayName("확정건은 누구에게나 점유, 대기건은 본인에게만 점유, 취소건은 점유 아님")
    void statusRules() {
        assertThat(occupies(dto(OTHER, "Y", "N", 13, 17), 15, ME)).isTrue();
        assertThat(occupies(dto(OTHER, "N", "N", 13, 17), 15, ME)).isFalse();
        assertThat(occupies(dto(ME, "N", "N", 13, 17), 15, ME)).isTrue();
        assertThat(occupies(dto(OTHER, "Y", "Y", 13, 17), 15, ME)).isFalse();
        // 비로그인은 대기건을 점유로 보지 않는다
        assertThat(occupies(dto(ME, "N", "N", 13, 17), 15, null)).isFalse();
    }

    @Test
    @DisplayName("구간 끝 슬롯은 비어 있고, 자정을 넘는 구간도 새벽 슬롯을 점유한다")
    void rangeEdges() {
        ReservedTimeDto afternoon = dto(OTHER, "Y", "N", 13, 17);
        assertThat(occupies(afternoon, 16, ME)).isTrue();
        assertThat(occupies(afternoon, 17, ME)).isFalse();
        assertThat(occupies(afternoon, 12, ME)).isFalse();

        ReservedTimeDto overnight = dto(OTHER, "Y", "N", 22, 2);
        LocalDateTime oneAm = LocalDateTime.of(MON.plusDays(1), LocalTime.of(1, 0));
        assertThat(overnight.toTimeRange().isOverlapping(oneAm, oneAm.plusHours(1), ME)).isTrue();
    }
}
