package com.bgmagitapi.origin.payment.entity.enumeration;

public enum PaymentStatus {
    // 주문 생성됨(결제 전)
    READY,
    // 결제 승인 완료
    DONE,
    // 일부만 환불되고 잔액이 남은 상태(인원 축소 환불, 50% 환불 등)
    PARTIAL_CANCELED,
    // 결제 전액 취소(환불) 완료
    CANCELED,
    // 결제 실패/중단
    ABORTED;

    /**
     * 돈이 실제로 들어와 있는(=정산된) 상태인지. 잔액이 0이어도 결제 이력으로는 유효하다.
     *
     * 영수증 링크 조회와 환불 대상 조회가 이 술어를 함께 본다. DONE 만 보던 시절에는
     * 부분환불이 생기는 순간 영수증이 사라지고, 잔액이 남은 결제가 취소 대상에서 빠져
     * 영영 환불되지 않는 구멍이 있었다.
     */
    public boolean isSettled() {
        return this == DONE || this == PARTIAL_CANCELED || this == CANCELED;
    }

    /** 아직 환불할 잔액이 남아 있을 수 있는 상태. */
    public boolean isRefundable() {
        return this == DONE || this == PARTIAL_CANCELED;
    }
}
