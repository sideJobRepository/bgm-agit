package com.bgmagitapi.origin.controller.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 예약 인원 변경(축소) 요청.
 *
 * 증원은 받지 않는다 — 공지대로 추가 인원은 현장에서 워크인 요금으로 결제한다.
 * 예약을 늘리려면 룸 정원과 다른 예약까지 다시 봐야 해서 결제만 더 받는 걸로 끝나지 않는다.
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
public class BgmAgitReservationPeopleRequest {

    @NotNull(message = "예약 번호는 필수입니다.")
    private Long reservationNo;

    @NotNull(message = "변경할 인원은 필수입니다.")
    private Integer people;
}
