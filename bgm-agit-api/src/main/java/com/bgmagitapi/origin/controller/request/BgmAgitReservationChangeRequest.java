package com.bgmagitapi.origin.controller.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 예약 룸/인원 변경 요청(PUT /reservation/change). 인원과 룸을 한 번에 바꾼다.
 * roomIds 가 비면 지금 방 그대로로 본다. onsite 는 관리자 증원의 현장 결제 처리용(손님이 보내면 거절).
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
public class BgmAgitReservationChangeRequest {

    @NotNull(message = "예약 ID는 필수입니다.")
    private Long reservationId;

    @NotNull(message = "변경할 인원은 필수입니다.")
    private Integer people;

    private List<Long> roomIds;

    private Boolean onsite;
}
