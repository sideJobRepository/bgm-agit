package com.bgmagitapi.origin.util;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * 예약 취소·인원 축소 시의 환불 비율 정책.
 *
 * 이용일 기준 48시간 전까지 전액, 24시간 전까지 절반, 그 안쪽은 환불하지 않는다.
 * 당일 취소와 노쇼가 0%가 되는 것도 이 규칙에서 자동으로 나온다(둘 다 24시간 안쪽이다).
 * 관리자 취소도 같은 규칙을 쓴다 — 매장 귀책으로 전액을 돌려줘야 하면 토스 상점관리자에서 직접 환불한다.
 */
public final class ReservationRefundPolicy {

    public static final int FULL_REFUND_HOURS = 48;
    public static final int HALF_REFUND_HOURS = 24;

    private ReservationRefundPolicy() {
    }

    /**
     * 환불 비율(%). 기준 시각을 모르면(useStartAt == null) 보수적으로 0 을 준다.
     *
     * 경계값은 손님에게 유리한 쪽으로 — 정확히 48시간 전이면 100%, 정확히 24시간 전이면 50%.
     * 이미 시작된 예약은 음수가 되어 0% 로 떨어진다.
     */
    public static int refundRate(LocalDateTime useStartAt, LocalDateTime now) {
        if (useStartAt == null || now == null) {
            return 0;
        }
        long hours = Duration.between(now, useStartAt).toHours();
        if (hours >= FULL_REFUND_HOURS) {
            return 100;
        }
        if (hours >= HALF_REFUND_HOURS) {
            return 50;
        }
        return 0;
    }

    /**
     * 비율을 적용한 환불 금액. 원 단위 내림.
     *
     * 실제 토스에 보낼 금액은 호출부에서 결제 잔액으로 한 번 더 클램프해야 한다.
     * 정책 계산만 믿으면 재결제·중복 환불 상황에서 결제액을 넘는 취소 요청이 나간다.
     */
    public static int refundAmount(int baseAmount, int rate) {
        if (baseAmount <= 0 || rate <= 0) {
            return 0;
        }
        if (rate >= 100) {
            return baseAmount;
        }
        return (int) ((long) baseAmount * rate / 100);
    }
}
