package com.bgmagitapi.origin.payment.service.response;

/**
 * 환불 처리 결과.
 *
 * 토스 호출이 실패해도 예약 취소는 진행하므로(자리를 비워주는 쪽이 먼저다) 실패를 예외가 아니라
 * 값으로 돌려준다. 호출부가 이 값을 보고 손님에게 "취소는 됐고 환불은 확인 중"이라고 안내한다.
 */
public record PaymentRefundResult(
        int rate,
        int requestedAmount,
        int refundedAmount,
        boolean failed,
        String failMessage
) {
    public static PaymentRefundResult nothingToRefund(int rate) {
        return new PaymentRefundResult(rate, 0, 0, false, null);
    }

    public static PaymentRefundResult succeeded(int rate, int requested, int refunded) {
        return new PaymentRefundResult(rate, requested, refunded, false, null);
    }

    public static PaymentRefundResult failed(int rate, int requested, int refunded, String message) {
        return new PaymentRefundResult(rate, requested, refunded, true, message);
    }
}
