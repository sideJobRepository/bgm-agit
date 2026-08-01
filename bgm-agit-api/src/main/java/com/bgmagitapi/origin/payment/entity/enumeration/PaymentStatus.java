package com.bgmagitapi.origin.payment.entity.enumeration;

public enum PaymentStatus {
    // 주문 생성됨(결제 전)
    READY,
    // 결제 승인 완료
    DONE,
    // 결제 취소(환불) 완료
    CANCELED,
    // 결제 실패/중단
    ABORTED
}
