package com.bgmagitapi.origin.payment.controller.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderCreateRequest {

    // 결제할 예약 그룹 번호
    @NotNull(message = "예약 번호는 필수입니다.")
    private Long reservationNo;
}
