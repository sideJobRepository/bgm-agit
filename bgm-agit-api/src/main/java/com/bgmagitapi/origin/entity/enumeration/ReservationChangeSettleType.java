package com.bgmagitapi.origin.entity.enumeration;

public enum ReservationChangeSettleType {
    // 토스 추가결제(손님 증원)
    TOSS,
    // 인원 감소 부분환불
    REFUND,
    // 금액 변동 없음(룸만 이동, 미결제 예약, 마작 기록 정정)
    NONE
}
