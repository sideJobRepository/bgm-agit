package com.bgmagitapi.origin.payment.service.response;

/**
 * 환불 처리 결과.
 *
 * 토스 호출이 실패해도 예약 취소는 진행하므로(자리를 비워주는 쪽이 먼저다) 실패를 예외가 아니라
 * 값으로 돌려준다. 호출부가 이 값을 보고 손님에게 "취소는 됐고 환불은 확인 중"이라고 안내한다.
 *
 * {@code rejected} 는 토스가 명시적으로 거절한 실패(4xx 응답 = 돈이 움직이지 않았음이 확실)다.
 * 타임아웃·통신 오류는 토스에서 처리됐는지 알 수 없어 false 다. 호출부가 되돌릴지 판단할 때 쓴다.
 */
public record PaymentRefundResult(
        int rate,
        int requestedAmount,
        int refundedAmount,
        boolean failed,
        boolean rejected,
        String failMessage,
        boolean unpaid
) {
    /**
     * 환불할 결제가 아예 없음(미결제 대기 예약).
     * "결제했지만 환불 0%"(nothingToRefund)와 구분해야 손님에게 "환불 금액 없음"이라는 오해 문구가 안 나간다.
     */
    public static PaymentRefundResult noPayment(int rate) {
        return new PaymentRefundResult(rate, 0, 0, false, false, null, true);
    }

    /** 결제는 있으나 환불 비율·잔액상 돌려줄 금액이 0원. */
    public static PaymentRefundResult nothingToRefund(int rate) {
        return new PaymentRefundResult(rate, 0, 0, false, false, null, false);
    }

    public static PaymentRefundResult succeeded(int rate, int requested, int refunded) {
        return new PaymentRefundResult(rate, requested, refunded, false, false, null, false);
    }

    /** 토스가 거절한 실패(돈이 움직이지 않음이 확실). */
    public static PaymentRefundResult rejected(int rate, int requested, int refunded, String message) {
        return new PaymentRefundResult(rate, requested, refunded, true, true, message, false);
    }

    /** 결과를 알 수 없는 실패(타임아웃·통신 오류). */
    public static PaymentRefundResult failed(int rate, int requested, int refunded, String message) {
        return new PaymentRefundResult(rate, requested, refunded, true, false, message, false);
    }
}
