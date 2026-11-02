package com.bgmagitapi.origin.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 예약 룸/인원 변경 정책(사장님 확정 2026-11-02). 순수 계산만 둔다 — DB 를 보는 판정은 서비스가 한다.
 *
 * 손님은 이용 시작 24시간 전까지만 바꿀 수 있다. 그래서 손님 감소 환불은 늘 100% 또는 50% 이고
 * (ReservationRefundPolicy 와 같은 경계), 그 안쪽은 매장 문의로 돌린다. 관리자는 시작 전까지.
 */
public final class ReservationChangePolicy {

    public static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private ReservationChangePolicy() {
    }

    /** 손님 변경 마감 = 이용 시작 − 24시간(환불 50% 경계와 같다) */
    public static LocalDateTime customerDeadline(LocalDateTime useStartAt) {
        return useStartAt == null ? null : useStartAt.minusHours(ReservationRefundPolicy.HALF_REFUND_HOURS);
    }

    public static String formatDeadline(LocalDateTime useStartAt) {
        LocalDateTime deadline = customerDeadline(useStartAt);
        return deadline == null ? null : deadline.format(DATE_TIME);
    }

    /**
     * 지금 이 사람이 이 예약을 바꿀 수 없는 이유. 바꿀 수 있으면 null.
     * 예약내역 버튼 노출(changeable)·변경 옵션 조회·변경 요청이 모두 이 판정 하나를 쓴다.
     *
     * @param flat 마작 대탁(정액)인지. 손님은 변경 불가, 관리자는 인원 기록 정정만 가능
     */
    public static String blockReason(boolean canceled, boolean flat, boolean admin,
                                     LocalDateTime useStartAt, LocalDateTime now) {
        if (canceled) {
            return "취소된 예약은 변경할 수 없습니다.";
        }
        if (useStartAt == null || now == null) {
            return "예약 시간 정보가 없어 변경할 수 없습니다. 매장으로 문의해 주세요.";
        }
        if (!useStartAt.isAfter(now)) {
            return "이미 시작된 예약은 변경할 수 없습니다. 매장으로 문의해 주세요.";
        }
        if (flat && !admin) {
            return "마작 대탁 예약은 변경할 수 없습니다. 매장으로 문의해 주세요.";
        }
        // 경계 시각 정각은 허용(now == 마감). 환불 규정도 정확히 24시간 전이면 50% 를 준다
        if (!admin && now.isAfter(customerDeadline(useStartAt))) {
            return "예약 변경은 이용 24시간 전(" + formatDeadline(useStartAt) + ")까지 가능합니다. 매장으로 문의해 주세요.";
        }
        return null;
    }
}
