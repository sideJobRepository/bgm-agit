package com.bgmagitapi.origin.controller.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

/** 관리자 벙주 혜택 적용 내역 한 줄 */
@Getter
@AllArgsConstructor
public class BgmAgitBungjuBenefitResponse {
    private Long reservationId;
    private LocalDate date;
    private String time;
    private String roomNames;
    private String memberName;
    private String memberNickname;
    private String phoneNo;
    private Integer people;
    // 예약에 박힌 혜택 1인 단가
    private Integer unitPrice;
    // 결제 잔액(부분환불 뒤 남은 금액). 결제 전이면 null
    private Integer paidAmount;
    // 대기 / 확정 / 취소
    private String status;
}
