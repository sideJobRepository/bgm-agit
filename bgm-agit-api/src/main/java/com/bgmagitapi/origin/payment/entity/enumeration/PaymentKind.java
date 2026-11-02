package com.bgmagitapi.origin.payment.entity.enumeration;

public enum PaymentKind {
    // 예약 이용요금(또는 마작 예약금) 결제. 컬럼이 null 인 옛 결제도 이것으로 본다
    ORIGINAL,
    // 예약 변경(증원) 추가결제
    CHANGE
}
