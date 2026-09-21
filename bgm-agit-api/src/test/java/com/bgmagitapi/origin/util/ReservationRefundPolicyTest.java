package com.bgmagitapi.origin.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 환불 비율은 손님 돈이 걸린 경계라 정확히 48h/24h 지점을 못 박아 둔다.
 */
class ReservationRefundPolicyTest {

    private static final LocalDateTime USE_START = LocalDateTime.of(2026, 10, 10, 13, 0);

    @Test
    @DisplayName("48시간 이상 남으면 전액 환불")
    void fullRefundBefore48Hours() {
        assertThat(ReservationRefundPolicy.refundRate(USE_START, USE_START.minusHours(72))).isEqualTo(100);
        // 경계값은 손님에게 유리한 쪽으로 — 정확히 48시간 전이면 100%
        assertThat(ReservationRefundPolicy.refundRate(USE_START, USE_START.minusHours(48))).isEqualTo(100);
    }

    @Test
    @DisplayName("48시간 미만 24시간 이상이면 절반 환불")
    void halfRefundBetween48And24() {
        assertThat(ReservationRefundPolicy.refundRate(USE_START, USE_START.minusHours(48).plusMinutes(1))).isEqualTo(50);
        assertThat(ReservationRefundPolicy.refundRate(USE_START, USE_START.minusHours(24))).isEqualTo(50);
    }

    @Test
    @DisplayName("24시간 이내·당일·노쇼는 환불 없음")
    void noRefundWithin24Hours() {
        assertThat(ReservationRefundPolicy.refundRate(USE_START, USE_START.minusHours(24).plusMinutes(1))).isZero();
        assertThat(ReservationRefundPolicy.refundRate(USE_START, USE_START.minusHours(1))).isZero();
        // 이미 시작됨(노쇼)
        assertThat(ReservationRefundPolicy.refundRate(USE_START, USE_START.plusHours(3))).isZero();
    }

    @Test
    @DisplayName("기준 시각을 모르면 보수적으로 0%")
    void unknownStartMeansNoRefund() {
        assertThat(ReservationRefundPolicy.refundRate(null, USE_START)).isZero();
        assertThat(ReservationRefundPolicy.refundRate(USE_START, null)).isZero();
    }

    @Test
    @DisplayName("환불 금액은 원 단위 내림")
    void refundAmountRoundsDown() {
        assertThat(ReservationRefundPolicy.refundAmount(45000, 100)).isEqualTo(45000);
        assertThat(ReservationRefundPolicy.refundAmount(45000, 50)).isEqualTo(22500);
        // 홀수 원이 나오는 금액도 넘치지 않게 내림
        assertThat(ReservationRefundPolicy.refundAmount(9001, 50)).isEqualTo(4500);
        assertThat(ReservationRefundPolicy.refundAmount(45000, 0)).isZero();
        assertThat(ReservationRefundPolicy.refundAmount(0, 100)).isZero();
    }
}
