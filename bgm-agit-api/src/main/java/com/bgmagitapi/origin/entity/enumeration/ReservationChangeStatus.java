package com.bgmagitapi.origin.entity.enumeration;

public enum ReservationChangeStatus {
    // 추가결제 대기. 결제 승인되는 순간 룸·인원이 바뀐다(그 전엔 아무것도 안 바뀌고 방도 안 잡는다)
    PENDING,
    // 예약에 반영됨
    APPLIED,
    // 새 변경 요청·예약 취소로 무효가 됨. 이 상태의 추가결제 주문은 승인하지 않는다
    ABORTED
}
