package com.bgmagitapi.origin.payment.entity.enumeration;

public enum PaymentCancelStatus {
    // 토스 호출 직전에 선커밋된 상태. 이 행의 PK 가 멱등키가 된다
    REQUESTED,
    // 토스 취소 성공
    DONE,
    // 토스가 거절했거나 통신이 실패. 예약 취소는 그대로 진행되고 관리자가 수동 환불한다
    FAILED
}
