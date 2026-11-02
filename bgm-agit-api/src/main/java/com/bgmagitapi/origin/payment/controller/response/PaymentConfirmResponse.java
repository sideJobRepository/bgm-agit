package com.bgmagitapi.origin.payment.controller.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentConfirmResponse {
    private String orderId;
    private Long reservationId;
    private Integer amount;
    private String status;
    private String method;
    private String receiptUrl;
    // 룸 이용 안내 대상 예약인지(11/2 이후 이용분 룸). 결제 완료 화면 안내용
    private boolean roomNotice;
    // 회원 1명당 하루 1룸 제한 대상인지(제한을 꺼 두면 늘 false)
    private boolean oneRoomPerDay;
    // ORIGINAL(이용요금) / CHANGE(예약 변경 추가결제). 결제 완료 화면이 확정 문구 대신 변경 문구를 고르는 데 쓴다
    private String paymentKind;
    // 지금 예약의 방 이름(합쳐 예약이면 "M-1, M-2")과 인원. 변경 결제면 바뀐 뒤의 값이다
    private String roomNames;
    private Integer people;
}
