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
}
